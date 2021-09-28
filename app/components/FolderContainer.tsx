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

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/MenuOpen';
import Badge from '@material-ui/core/Badge';
import { Tooltip } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import DefaultPerspectiveIcon from '@material-ui/icons/GridOn';
import GalleryPerspectiveIcon from '@material-ui/icons/Camera';
import MapiquePerspectiveIcon from '@material-ui/icons/Map';
// import KanBanPerspectiveIcon from '@material-ui/icons/Dashboard';
import LocationMenu from './menus/LocationMenu';
import i18n from '../services/i18n';
import { getMaxSearchResults, getDesktopMode } from '-/reducers/settings';
import { getLocations } from '-/reducers/locations';
import {
  actions as AppActions,
  getDirectoryContent,
  getSearchResultCount,
  isReadOnlyMode,
  getCurrentLocationPath,
  getCurrentDirectoryPerspective,
  OpenedEntry,
  perspectives,
  getSelectedEntries
} from '../reducers/app';
import TaggingActions from '../reducers/tagging-actions';
import LoadingLazy from '../components/LoadingLazy';
import { Pro } from '../pro';
import AppConfig from '-/config';
import RenameEntryDialog from '-/components/dialogs/RenameEntryDialog';
import { TS } from '-/tagspaces.namespace';
import PathBreadcrumbs from './PathBreadcrumbs';

const GridPerspective = React.lazy(() =>
  import(
    /* webpackChunkName: "GridPerspective" */ '../perspectives/grid-perspective/'
  )
);
const GridPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <GridPerspective {...props} />
  </React.Suspense>
);

let GalleryPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.GalleryPerspective) {
  // GalleryPerspective = React.lazy(() => import(/* webpackChunkName: "GalleryPerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/gallery'));
  // eslint-disable-next-line prefer-destructuring
  GalleryPerspective = Pro.Perspectives.GalleryPerspective;
}
const GalleryPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <GalleryPerspective {...props} />
  </React.Suspense>
);

let MapiquePerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.MapiquePerspective) {
  // MapiquePerspective = React.lazy(() => import(/* webpackChunkName: "MapiquePerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/mapique'));
  // eslint-disable-next-line prefer-destructuring
  MapiquePerspective = Pro.Perspectives.MapiquePerspective;
}
const MapiquePerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <MapiquePerspective {...props} />
  </React.Suspense>
);

/* let TreeVizPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.TreeVizPerspective) {
  // TreeVizPerspective = React.lazy(() => import(/!* webpackChunkName: "TreeVizPerspective" *!/ '../node_modules/@tagspaces/pro/modules/perspectives/treeviz'));
  // eslint-disable-next-line prefer-destructuring
  TreeVizPerspective = Pro.Perspectives.TreeVizPerspective;
}
const TreeVizPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <TreeVizPerspective {...props} />
  </React.Suspense>
); */

let KanBanPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.KanBanPerspective) {
  // eslint-disable-next-line prefer-destructuring
  KanBanPerspective = Pro.Perspectives.KanBanPerspective;
}
const KanBanPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <KanBanPerspective {...props} />
  </React.Suspense>
);

const WelcomePanel = React.lazy(() =>
  import(/* webpackChunkName: "WelcomePanel" */ './WelcomePanel')
);
const WelcomePanelAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <WelcomePanel {...props} />
  </React.Suspense>
);

const CounterBadge: any = withStyles(theme => ({
  badge: {
    top: '50%',
    right: -15,
    color:
      theme.palette.type === 'light'
        ? theme.palette.grey[900]
        : theme.palette.grey[200],
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[900]
  }
}))(Badge);

const styles: any = (theme: any) => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column'
  },
  toolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    display: 'flex',
    overflowX: AppConfig.isFirefox ? 'auto' : 'overlay'
  },
  topPanel: {
    height: 50,
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  centerPanel: {
    flex: '1 1 auto',
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  flexMiddle: {
    flex: '1 1 10%',
    display: 'flex',
    flexDirection: 'column'
  },
  folderButton: {
    minWidth: 30,
    paddingLeft: 3,
    paddingRight: 3,
    lineHeight: '17px',
    margin: '0 auto',
    backgroundColor: theme.palette.background.default
  },
  locationSelectorButton: {
    whiteSpace: 'nowrap',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center'
  },
  perspecitveSwitch: {
    bottom: 80,
    right: 30,
    zIndex: 1000,
    opacity: 0.9,
    position: 'absolute',
    backgroundColor: theme.palette.background.default
  }
});

interface Props {
  classes: any;
  settings: any;
  theme: any;
  windowHeight: number;
  windowWidth: number;
  directoryContent: Array<Object>;
  currentDirectoryPath: string | null;
  searchResultCount: number;
  addTags: () => void;
  removeTags: () => void;
  removeAllTags: () => void;
  editTagForEntry: () => void;
  renameFile: () => void;
  openDirectory: () => void;
  showInFileManager: () => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
  loadParentDirectoryContent: () => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  isReadOnlyMode: boolean;
  isDesktopMode: boolean;
  showNotification: (content: string) => void;
  openSearchPanel: () => void;
  toggleDrawer?: () => void;
  drawerOpened: boolean;
  setCurrentDirectoryPerspective: (perspective: string) => void;
  maxSearchResults: number;
  currentDirectoryPerspective: string;
  currentLocationPath: string;
  locations: Array<Location>;
  openedFiles: Array<OpenedEntry>;
  updateCurrentDirEntry: (path: string, entry: Object) => void;
  setCurrentDirectoryColor: (color: string) => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  // rightPanelWidth: number;
}

const FolderContainer = (props: Props) => {
  useEffect(() => {
    if (props.selectedEntries.length < 2) {
      if (props.openedFiles.length > 0) {
        const openedFile = props.openedFiles[0];
        if (openedFile.path === props.currentDirectoryPath) {
          if (openedFile.color) {
            props.setCurrentDirectoryColor(openedFile.color);
          }
          if (openedFile.perspective) {
            props.setCurrentDirectoryPerspective(openedFile.perspective);
          }
        } else if (openedFile.editMode) {
          // changed) {
          /* const currentEntry = enhanceOpenedEntry(
            openedFile,
            props.settings.tagDelimiter
          );
          props.updateCurrentDirEntry(openedFile.path, currentEntry); */
        }
      }
    }
  }, [props.openedFiles]);

  const [isRenameEntryDialogOpened, setIsRenameEntryDialogOpened] = useState<
    boolean
  >(false);

  const switchPerspective = (perspectiveId: string) => {
    props.setCurrentDirectoryPerspective(perspectiveId);
  };

  const showWelcomePanel =
    !props.currentDirectoryPath && props.directoryContent.length < 1;

  const renderPerspective = () => {
    if (showWelcomePanel) {
      return AppConfig.showWelcomePanel ? (
        <WelcomePanelAsync />
      ) : (
        <React.Fragment />
      );
    }
    if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.GALLERY
    ) {
      return (
        <GalleryPerspectiveAsync
          directoryContent={props.directoryContent}
          openFsEntry={props.openFsEntry}
          currentDirectoryPath={props.currentDirectoryPath}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
        />
      );
    }
    if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.MAPIQUE
    ) {
      return (
        <MapiquePerspectiveAsync
          directoryContent={props.directoryContent}
          currentDirectoryPath={props.currentDirectoryPath}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
          openedFiles={props.openedFiles}
        />
      );
    }
    if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.KANBAN
    ) {
      return (
        <KanBanPerspectiveAsync
          directoryContent={props.directoryContent}
          loadDirectoryContent={props.loadDirectoryContent}
          openFsEntry={props.openFsEntry}
          openRenameEntryDialog={() => setIsRenameEntryDialogOpened(true)}
          loadParentDirectoryContent={props.loadParentDirectoryContent}
          renameFile={props.renameFile}
          openDirectory={props.openDirectory}
          showInFileManager={props.showInFileManager}
          currentDirectoryPath={props.currentDirectoryPath}
          addTags={props.addTags}
          editTagForEntry={props.editTagForEntry}
          removeTags={props.removeTags}
          removeAllTags={props.removeAllTags}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
        />
      );
    }
    return (
      <GridPerspectiveAsync
        directoryContent={props.directoryContent}
        loadDirectoryContent={props.loadDirectoryContent}
        openFsEntry={props.openFsEntry}
        openRenameEntryDialog={() => setIsRenameEntryDialogOpened(true)}
        loadParentDirectoryContent={props.loadParentDirectoryContent}
        renameFile={props.renameFile}
        openDirectory={props.openDirectory}
        showInFileManager={props.showInFileManager}
        currentDirectoryPath={props.currentDirectoryPath}
        addTags={props.addTags}
        editTagForEntry={props.editTagForEntry}
        removeTags={props.removeTags}
        removeAllTags={props.removeAllTags}
        windowWidth={props.windowWidth}
      />
    );
  };

  const {
    currentDirectoryPath = '',
    loadDirectoryContent,
    searchResultCount,
    classes,
    maxSearchResults,
    openSearchPanel,
    toggleDrawer,
    drawerOpened,
    isDesktopMode,
    theme,
    loadParentDirectoryContent,
    currentDirectoryPerspective,
    currentLocationPath,
    setSelectedEntries,
    openDirectory,
    reflectCreateEntry,
    openFsEntry
    // rightPanelWidth
  } = props;

  let searchResultCounterText = searchResultCount + ' ' + i18n.t('entries');
  if (searchResultCount >= maxSearchResults) {
    searchResultCounterText =
      'Max. search count reached, showing only the first ' +
      searchResultCount +
      ' entries.';
  }

  const currentPerspective =
    currentDirectoryPerspective || perspectives.DEFAULT;

  return (
    <div data-tid="folderContainerTID" style={{ position: 'relative' }}>
      <div className={classes.mainPanel}>
        <div className={classes.topPanel}>
          <div className={classes.toolbar}>
            <Button
              id="mobileMenuButton"
              style={{
                marginLeft: -8,
                transform: drawerOpened ? 'rotate(0deg)' : 'rotate(180deg)',
                maxHeight: 40
              }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </Button>
            {/* <CounterBadge
              showZero={true}
              title={searchResultCounterText}
              badgeContent={searchResultCount}
              color="secondary"
              max={maxSearchResults - 1}
              onClick={() => {
                openSearchPanel();
              }}
            /> */}
            <Button
              id="toggleSearch"
              style={{
                marginLeft: -8,
                maxHeight: 40
              }}
              onClick={toggleDrawer}
            >
              <SearchIcon />
            </Button>
            <div className={classes.flexMiddle} />
            <LocationMenu />
            <PathBreadcrumbs
              currentDirectoryPath={currentDirectoryPath}
              currentLocationPath={currentLocationPath}
              loadDirectoryContent={loadDirectoryContent}
              switchPerspective={switchPerspective}
              setSelectedEntries={setSelectedEntries}
              openDirectory={openDirectory}
              reflectCreateEntry={reflectCreateEntry}
              openFsEntry={openFsEntry}
              isReadOnlyMode={props.isReadOnlyMode}
              isDesktopMode={isDesktopMode}
              openRenameDirectoryDialog={() =>
                setIsRenameEntryDialogOpened(true)
              }
            />
          </div>
        </div>
        <div
          className={classes.centerPanel}
          style={{ height: props.windowHeight }}
        >
          {renderPerspective()}
          {isRenameEntryDialogOpened && (
            <RenameEntryDialog
              open={isRenameEntryDialogOpened}
              currentDirectoryPath={props.currentDirectoryPath}
              onClose={() => setIsRenameEntryDialogOpened(false)}
            />
          )}
        </div>
      </div>
      {Pro && props.isDesktopMode && !showWelcomePanel && (
        <ToggleButtonGroup
          value={currentPerspective}
          size="small"
          aria-label="change perspective"
          exclusive
          className={classes.perspecitveSwitch}
          /* style={{
            right: rightPanelWidth + 30
          }} */
        >
          <ToggleButton
            value={perspectives.DEFAULT}
            aria-label={perspectives.DEFAULT}
            onClick={() => switchPerspective(perspectives.DEFAULT)}
          >
            <Tooltip arrow title="Switch to default perspective">
              <div style={{ display: 'flex' }}>
                <DefaultPerspectiveIcon />
                {perspectives.DEFAULT}
              </div>
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value={perspectives.GALLERY}
            aria-label={perspectives.GALLERY}
            onClick={() => switchPerspective(perspectives.GALLERY)}
          >
            <Tooltip arrow title="Switch to Gallery perspective">
              <div style={{ display: 'flex' }}>
                <GalleryPerspectiveIcon />
                {perspectives.GALLERY}
              </div>
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value={perspectives.MAPIQUE}
            aria-label={perspectives.MAPIQUE}
            onClick={() => switchPerspective(perspectives.MAPIQUE)}
          >
            <Tooltip arrow title="Switch to Mapique perspective">
              <div style={{ display: 'flex' }}>
                <MapiquePerspectiveIcon />
                {perspectives.MAPIQUE}
              </div>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    settings: state.settings,
    selectedEntries: getSelectedEntries(state),
    directoryContent: getDirectoryContent(state),
    currentDirectoryPerspective: getCurrentDirectoryPerspective(state),
    searchResultCount: getSearchResultCount(state),
    currentLocationPath: getCurrentLocationPath(state),
    locations: getLocations(state),
    maxSearchResults: getMaxSearchResults(state),
    isDesktopMode: getDesktopMode(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      addTags: TaggingActions.addTags,
      removeTags: TaggingActions.removeTags,
      removeAllTags: TaggingActions.removeAllTags,
      editTagForEntry: TaggingActions.editTagForEntry,
      renameFile: AppActions.renameFile,
      openDirectory: AppActions.openDirectory,
      showInFileManager: AppActions.showInFileManager,
      openFsEntry: AppActions.openFsEntry,
      reflectCreateEntry: AppActions.reflectCreateEntry,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      loadParentDirectoryContent: AppActions.loadParentDirectoryContent,
      setSelectedEntries: AppActions.setSelectedEntries,
      showNotification: AppActions.showNotification,
      openSearchPanel: AppActions.openSearchPanel,
      setCurrentDirectoryPerspective: AppActions.setCurrentDirectoryPerspective,
      updateCurrentDirEntry: AppActions.updateCurrentDirEntry,
      setCurrentDirectoryColor: AppActions.setCurrentDirectoryColor
    },
    dispatch
  );
}

const areEqual = (prevProp: Props, nextProp: Props) =>
  // nextProp.rightPanelWidth === prevProp.rightPanelWidth &&
  nextProp.drawerOpened === prevProp.drawerOpened &&
  nextProp.isDesktopMode === prevProp.isDesktopMode &&
  nextProp.currentDirectoryPath === prevProp.currentDirectoryPath &&
  nextProp.currentDirectoryPerspective ===
    prevProp.currentDirectoryPerspective &&
  nextProp.currentLocationPath === prevProp.currentLocationPath &&
  JSON.stringify(nextProp.directoryContent) ===
    JSON.stringify(prevProp.directoryContent) &&
  JSON.stringify(nextProp.openedFiles) ===
    JSON.stringify(prevProp.openedFiles) &&
  JSON.stringify(nextProp.theme) === JSON.stringify(prevProp.theme) &&
  nextProp.windowWidth === prevProp.windowWidth &&
  nextProp.windowHeight === prevProp.windowHeight;

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(
  // @ts-ignore
  React.memo(withStyles(styles, { withTheme: true })(FolderContainer), areEqual)
);
