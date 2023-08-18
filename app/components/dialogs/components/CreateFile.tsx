/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React, { useReducer, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import {
  actions as AppActions,
  getDirectoryPath,
  AppDispatch
} from '-/reducers/app';
import { getFirstRWLocation } from '-/reducers/locations';
import { TS } from '-/tagspaces.namespace';
import Tooltip from '-/components/Tooltip';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { FormControl } from '@mui/material';
import { fileNameValidation } from '-/services/utils-io';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';

const PREFIX = 'CreateFile';

const classes = {
  createButton: `${PREFIX}-createButton`
};

const StyledGrid = styled(Grid)(() => ({
  [`& .${classes.createButton}`]: {
    width: '100%',
    textAlign: 'center'
  }
}));

interface Props {
  //open: boolean;
  onClose: () => void;
  tidPrefix?: string;
}

function CreateFile(props: Props) {
  const { onClose, tidPrefix } = props;

  const dispatch: AppDispatch = useDispatch();
  const firstRWLocation = useSelector(getFirstRWLocation);
  const currentDirectoryPath: string | null = useSelector(getDirectoryPath);
  const { targetDirectoryPath } = useTargetPathContext();

  const fileName = useRef<string>(
    'note' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer
  );
  const [inputError, setInputError] = useState<boolean>(false);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const fileContent = '';

  const noSuitableLocation = !targetDirectoryPath;

  function tid(tid) {
    if (tidPrefix) {
      return tidPrefix + tid;
    }
    return tid;
  }

  function loadLocation() {
    if (!currentDirectoryPath && firstRWLocation) {
      dispatch(AppActions.openLocation(firstRWLocation));
    }
  }

  function createRichTextFile() {
    if (targetDirectoryPath && !fileNameValidation(fileName.current)) {
      loadLocation();
      dispatch(
        AppActions.createFileAdvanced(
          targetDirectoryPath,
          fileName.current,
          fileContent,
          'html'
        )
      );
      onClose();
    }
  }

  function createTextFile() {
    if (targetDirectoryPath && !fileNameValidation(fileName.current)) {
      loadLocation();
      dispatch(
        AppActions.createFileAdvanced(
          targetDirectoryPath,
          fileName.current,
          fileContent,
          'txt'
        )
      );
      onClose();
    }
  }

  function createMarkdownFile() {
    if (targetDirectoryPath && !fileNameValidation(fileName.current)) {
      loadLocation();
      dispatch(
        AppActions.createFileAdvanced(
          targetDirectoryPath,
          fileName.current,
          fileContent,
          'md'
        )
      );
      onClose();
    }
  }

  const onInputFocus = event => {
    if (fileName.current) {
      event.preventDefault();
      const { target } = event;
      target.focus();
      /*const indexOfBracket = fileName.current.indexOf(
        AppConfig.beginTagContainer
      );*/
      let endRange = fileName.current.length;
      // if (indexOfBracket > 0) {
      //   endRange = indexOfBracket;
      // }
      target.setSelectionRange(0, endRange);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fileName.current = event.target.value;
    handleValidation();
  };

  const handleValidation = () => {
    let noValid = fileNameValidation(fileName.current);

    if (noValid) {
      if (inputError !== noValid) {
        setInputError(noValid);
      } else {
        forceUpdate();
      }
    } else {
      setInputError(noValid);
    }
  };

  return (
    <StyledGrid style={{ flexGrow: 1, width: '100%' }} container spacing={1}>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            autoFocus
            error={inputError}
            margin="dense"
            name="entryName"
            label={i18n.t('core:newFileName')}
            onChange={handleInputChange}
            onFocus={onInputFocus}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
                createMarkdownFile();
              }
            }}
            defaultValue={fileName.current}
            disabled={noSuitableLocation}
            fullWidth={true}
            data-tid={tid('newEntryDialogInputTID')}
          />
          {inputError && (
            <FormHelperText>{i18n.t('core:fileNameHelp')}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <ButtonGroup
          style={{
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Button
            // variant="contained"
            onClick={createMarkdownFile}
            className={classes.createButton}
            data-tid={tid('createMarkdownButton')}
            disabled={noSuitableLocation}
          >
            <Tooltip title={i18n.t('createMarkdownTitle')}>
              <Typography
                variant="button"
                style={{ fontWeight: 'bold' }}
                display="block"
                gutterBottom
              >
                {i18n.t('createMarkdown')}
              </Typography>
            </Tooltip>
          </Button>
          <Button
            // variant="contained"
            onClick={createRichTextFile}
            className={classes.createButton}
            data-tid={tid('createRichTextFileButton')}
            disabled={noSuitableLocation}
          >
            <Tooltip title={i18n.t('createNoteTitle')}>
              <Typography variant="button" display="block" gutterBottom>
                {i18n.t('createRichTextFile')}
              </Typography>
            </Tooltip>
          </Button>
          <Button
            // variant="contained"
            onClick={createTextFile}
            className={classes.createButton}
            data-tid={tid('createTextFileButton')}
            disabled={noSuitableLocation}
          >
            <Tooltip title={i18n.t('createTextFileTitle')}>
              <Typography variant="button" display="block" gutterBottom>
                {i18n.t('createTextFile')}
              </Typography>
            </Tooltip>
          </Button>
        </ButtonGroup>
      </Grid>
    </StyledGrid>
  );
}

export default CreateFile;
