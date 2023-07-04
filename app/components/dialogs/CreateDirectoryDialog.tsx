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

import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import i18n from '-/services/i18n';
import { actions as AppActions } from '-/reducers/app';
import { joinPaths } from '@tagspaces/tagspaces-common/paths';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import PlatformIO from '-/services/platform-facade';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedDirectoryPath: string;
  createDirectory: (
    directoryPath: string,
    reflect: boolean
  ) => Promise<boolean>;
  callback?: (newDirPath: string) => void;
  reflect?: boolean;
}

function CreateDirectoryDialog(props: Props) {
  const [inputError, setInputError] = useState(false);
  const isFirstRun = useRef(true);
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [name, setName] = useState('');
  const { open, onClose, reflect } = props;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    handleValidation();
  });

  function handleValidation() {
    // const pathRegex = '^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$';
    // const nameRegex = '^[A-Z][-a-zA-Z]+$';
    if (name.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    if (!disableConfirmButton && name) {
      const dirPath = joinPaths(
        PlatformIO.getDirSeparator(),
        props.selectedDirectoryPath,
        name
      );
      props
        .createDirectory(dirPath, reflect !== undefined ? reflect : true)
        .then(() => {
          if (props.callback) {
            props.callback(dirPath);
          }
        });
      resetState();
      props.onClose();
    }
  }

  function onCancel() {
    resetState();
    onClose();
  }

  function resetState() {
    setName('');
    setInputError(false);
    setDisableConfirmButton(true);
  }

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } /*else if (event.key === 'Escape') {
          onClose();
        }*/
      }}
    >
      <DialogTitle>
        {i18n.t('core:createNewDirectoryTitle')}
        <DialogCloseButton testId="closeCreateDirectoryTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth
            error={inputError}
            margin="dense"
            autoFocus
            name="name"
            label={i18n.t('core:createNewDirectoryTitleName')}
            onChange={event => {
              const { target } = event;
              setName(target.value);
            }}
            value={name}
            data-tid="directoryName"
            id="directoryName"
          />
          <FormHelperText>{i18n.t('core:directoryNameHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeCreateNewDirectory" onClick={onCancel}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          variant="contained"
          data-tid="confirmCreateNewDirectory"
          id="confirmCreateNewDirectory"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function mapActionCreatorsToProps(dispatch) {
  //: Dispatch<CreateDirectoryAction>) {
  return bindActionCreators(
    {
      createDirectory: AppActions.createDirectory
    },
    dispatch
  );
}

export default connect(
  undefined,
  mapActionCreatorsToProps
  // @ts-ignore
)(CreateDirectoryDialog);
