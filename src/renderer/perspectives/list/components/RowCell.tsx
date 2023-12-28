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

import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme, styled } from '@mui/material/styles';
import classNames from 'classnames';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '-/components/Tooltip';
import { SelectedIcon, UnSelectedIcon } from '-/components/CommonIcons';
import {
  formatFileSize,
  formatDateTime,
} from '@tagspaces/tagspaces-common/misc';
import {
  extractTagsAsObjects,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
  getDescriptionPreview,
} from '-/services/utils-io';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagContainer from '-/components/TagContainer';
import TagsPreview from '-/components/TagsPreview';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import {
  actions as AppActions,
  AppDispatch,
  getLastThumbnailImageChange,
} from '-/reducers/app';
import { FolderIcon } from '-/components/CommonIcons';
import { EntrySizes } from '-/components/ZoomComponent';
import { getSupportedFileTypes, isReorderTags } from '-/reducers/settings';
import { defaultSettings } from '../index';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

const PREFIX = 'RowStyles';
export const classes = {
  rowCell: `${PREFIX}-rowCell`,
  rowHover: `${PREFIX}-rowHover`,
  selectedRowCell: `${PREFIX}-selectedRowCell`,
};

export const RowPaper = styled(Paper)(({ theme }) => ({
  [`& .${classes.rowCell}`]: {
    boxShadow: 'none',
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid ' + theme.palette.divider,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  [`& .${classes.rowHover}`]: {
    '&:hover': {
      backgroundColor: theme.palette.divider + ' !important',
    },
  },
  [`& .${classes.selectedRowCell}`]: {
    border: '1px solid' + theme.palette.primary.main + ' !important',
  },
}));

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  entrySize: EntrySizes;
  style?: any;
  thumbnailMode: any;
  selectEntry: (fsEntry: TS.FileSystemEntry) => void;
  deselectEntry: (fsEntry: TS.FileSystemEntry) => void;
  showTags: boolean;
  handleTagMenu: (event: Object, tag: TS.Tag, entryPath: string) => void;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  showEntriesDescription?: boolean;
}

export function calculateEntryHeight(entrySize: EntrySizes) {
  let entryHeight = 200;
  if (entrySize === EntrySizes.tiny) {
    entryHeight = 50;
  } else if (entrySize === EntrySizes.small) {
    entryHeight = 70;
  } else if (entrySize === EntrySizes.normal) {
    entryHeight = 90;
  } else if (entrySize === EntrySizes.big) {
    entryHeight = 120;
  } else if (entrySize === EntrySizes.huge) {
    entryHeight = 150;
  }
  return entryHeight;
}

function RowCell(props: Props) {
  const {
    selected,
    fsEntry,
    entrySize,
    thumbnailMode,
    handleTagMenu,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick,
    showEntriesDescription,
    showTags,
    selectEntry,
    deselectEntry,
    isLast,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const { selectedEntries } = useSelectedEntriesContext();
  const { addTags, editTagForEntry } = useTaggingActionsContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const lastThumbnailImageChange = useSelector(getLastThumbnailImageChange);
  const dispatch: AppDispatch = useDispatch();

  // You can use the dispatch function to dispatch actions
  const handleEditTag = (path: string, tag: TS.Tag, newTagTitle?: string) => {
    editTagForEntry(path, tag, newTagTitle);
  };
  const handleAddTags = (
    paths: Array<string>,
    tags: Array<TS.Tag>,
    updateIndex?,
  ) => {
    addTags(paths, tags, updateIndex);
  };

  const handleAddTag = (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
    dispatch(AppActions.addTag(tag, parentTagGroupUuid));
  };

  // remove isNewFile on Cell click it will open file in editMode
  const fSystemEntry: TS.FileSystemEntry = (({ isNewFile, ...o }) => o)(
    fsEntry,
  );

  const entryTitle = extractTitle(
    fSystemEntry.name,
    !fSystemEntry.isFile,
    PlatformIO.getDirSeparator(),
  );

  let description;
  if (showEntriesDescription) {
    description = fSystemEntry.description;
    if (
      description &&
      description.length > defaultSettings.maxDescriptionPreviewLength
    ) {
      description = getDescriptionPreview(
        description,
        defaultSettings.maxDescriptionPreviewLength,
      );
    }

    if (description && fSystemEntry.isFile) {
      description = ' | ' + description;
    }
  }

  const fileSystemEntryColor = findColorForEntry(
    fSystemEntry,
    supportedFileTypes,
  );
  const fileSystemEntryBgColor = findBackgroundColorForFolder(fSystemEntry);

  let fileNameTags = [];
  if (fSystemEntry.isFile) {
    fileNameTags = extractTagsAsObjects(
      fSystemEntry.name,
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator(),
    );
  }

  const fileSystemEntryTags = fSystemEntry.tags ? fSystemEntry.tags : [];
  const sideCarTagsTitles = fileSystemEntryTags.map((tag) => tag.title);
  const entryTags = [
    ...fileSystemEntryTags,
    ...fileNameTags.filter((tag) => !sideCarTagsTitles.includes(tag.title)),
  ];

  const entrySizeFormatted =
    fSystemEntry.isFile && formatFileSize(fSystemEntry.size) + ' | ';
  const entryLMDTFormatted =
    fSystemEntry.isFile &&
    fSystemEntry.lmdt &&
    formatDateTime(fSystemEntry.lmdt, true);

  let tagTitles = '';
  if (entryTags) {
    entryTags.map((tag) => {
      tagTitles += tag.title + ', ';
      return true;
    });
  }
  tagTitles = tagTitles.substring(0, tagTitles.length - 2);
  const tagPlaceholder = <TagsPreview tags={entryTags} />;

  function urlGetDelim(url) {
    return url.indexOf('?') > 0 ? '&' : '?';
  }

  const entryPath = fSystemEntry.path;

  const renderTags = useMemo(() => {
    let sideCarLength = 0;
    return entryTags.map((tag: TS.Tag, index) => {
      const tagContainer = readOnlyMode ? (
        <TagContainer
          tag={tag}
          key={entryPath + tag.title}
          entryPath={entryPath}
          addTags={handleAddTags}
          handleTagMenu={handleTagMenu}
        />
      ) : (
        <TagContainerDnd
          tag={tag}
          index={tag.type === 'sidecar' ? index : index - sideCarLength}
          key={entryPath + tag.title}
          entryPath={entryPath}
          addTags={handleAddTags}
          addTag={handleAddTag}
          handleTagMenu={handleTagMenu}
          selectedEntries={selectedEntries}
          editTagForEntry={handleEditTag}
          reorderTags={reorderTags}
        />
      );

      if (tag.type === 'sidecar') {
        sideCarLength = index + 1;
      }
      return tagContainer;
    });
  }, [entryTags, readOnlyMode, reorderTags, entryPath]);

  const entryHeight = calculateEntryHeight(entrySize);
  const isSmall =
    entrySize === EntrySizes.tiny || entrySize === EntrySizes.small;

  const backgroundColor = selected
    ? theme.palette.primary.light
    : fileSystemEntryBgColor;

  return (
    <RowPaper
      elevation={2}
      data-entry-id={fSystemEntry.uuid}
      className={classNames(
        classes.rowCell,
        selected && classes.selectedRowCell,
      )}
      style={{
        minHeight: entryHeight,
        marginBottom: isLast ? 40 : 'auto',
        backgroundColor: theme.palette.background.default,
      }}
      onContextMenu={(event) => handleGridContextMenu(event, fSystemEntry)}
      onDoubleClick={(event) => {
        handleGridCellDblClick(event, fSystemEntry);
      }}
      onClick={(event) => {
        event.stopPropagation();
        AppConfig.isCordovaiOS // TODO DoubleClick not fired in Cordova IOS
          ? handleGridCellDblClick(event, fSystemEntry)
          : handleGridCellClick(event, fSystemEntry);
      }}
      onDrag={(event) => {
        handleGridCellClick(event, fSystemEntry);
      }}
    >
      <Grid
        container
        wrap="nowrap"
        className={classes.rowHover}
        sx={{ backgroundColor }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            width: isSmall ? 80 : 60,
            padding: 3,
            marginRight: 5,
            textAlign: 'left',
            display: 'flex',
          }}
        >
          <div
            data-tid="rowCellTID"
            style={{
              display: 'flex',
              flexDirection: isSmall ? 'row' : 'column',
              flex: 1,
              padding: 4,
              borderWidth: 1,
              color: 'white',
              textTransform: 'uppercase',
              fontSize: 12,
              fontWeight: 'bold',
              borderRadius: 4,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              backgroundColor: fileSystemEntryColor,
              alignItems: 'center',
            }}
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              if (selected) {
                deselectEntry(fSystemEntry);
              } else {
                selectEntry(fSystemEntry);
              }
            }}
          >
            {selected ? <SelectedIcon /> : <UnSelectedIcon />}
            {fSystemEntry.isFile ? (
              <span
                style={{
                  width: '100%',
                  marginTop: isSmall ? 0 : 10,
                  textShadow: '1px 1px #8f8f8f',
                  overflowWrap: 'anywhere',
                }}
              >
                {fSystemEntry.extension}
              </span>
            ) : (
              <FolderIcon style={{ margin: '0 auto' }} />
            )}
          </div>
        </Grid>
        {isSmall ? (
          <Grid
            item
            xs
            zeroMinWidth
            style={{
              display: 'flex',
            }}
          >
            <Typography style={{ wordBreak: 'break-all', alignSelf: 'center' }}>
              <Tooltip title={fSystemEntry.path}>
                <>{entryTitle}</>
              </Tooltip>
              &nbsp;
              {showTags && entryTags ? renderTags : tagPlaceholder}
            </Typography>
          </Grid>
        ) : (
          <Grid item xs zeroMinWidth>
            <Tooltip title={fSystemEntry.path}>
              <Typography style={{ wordBreak: 'break-all' }}>
                {entryTitle}
              </Typography>
            </Tooltip>
            {showTags && entryTags ? renderTags : tagPlaceholder}
            <Typography
              style={{
                color: 'gray',
              }}
              variant="body2"
            >
              <Tooltip title={fSystemEntry.size + ' ' + t('core:sizeInBytes')}>
                <span>{entrySizeFormatted}</span>
              </Tooltip>
              <Tooltip
                title={
                  t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fSystemEntry.lmdt, true)
                }
              >
                <span>{entryLMDTFormatted}</span>
              </Tooltip>
              {/* <Tooltip title={t('core:entryDescription')}> */}
              <span>{description}</span>
              {/* </Tooltip> */}
            </Typography>
          </Grid>
        )}
        {fSystemEntry.thumbPath && (
          <Grid item style={{ display: 'flex', alignItems: 'center' }}>
            <img
              alt="thumbnail"
              src={
                fSystemEntry.thumbPath +
                (lastThumbnailImageChange &&
                lastThumbnailImageChange.thumbPath === fSystemEntry.thumbPath &&
                !PlatformIO.haveObjectStoreSupport() &&
                !PlatformIO.haveWebDavSupport()
                  ? urlGetDelim(fSystemEntry.thumbPath) +
                    lastThumbnailImageChange.dt
                  : '')
              }
              // @ts-ignore
              onError={(i) => (i.target.style.display = 'none')}
              loading="lazy"
              style={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                borderRadius: 5,
                marginBottom: 5,
                objectFit: thumbnailMode,
                paddingRight: 4,
                paddingTop: 4,
                height: entryHeight,
                width: entryHeight,
              }}
            />
          </Grid>
        )}
      </Grid>
    </RowPaper>
  );
}

export default RowCell;