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

import React from 'react';
import ParentFolder from '@mui/icons-material/ReplyOutlined';
import Help from '@mui/icons-material/Help';
import Remove from '@mui/icons-material/RemoveCircleOutline';
import History from '@mui/icons-material/ChangeHistoryTwoTone';
import Settings from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import SuitcaseIcon from '@mui/icons-material/WorkOutline';

export const ParentFolderIcon = props => (
  // <ParentDirIcon style={{ transform: 'rotate(-90deg)' }} /> SubdirectoryArrowLeft
  <ParentFolder {...props} />
);

export const HelpIcon = props => <Help {...props} />;

export const RemoveIcon = props => <Remove {...props} />;

export const HistoryIcon = props => <History {...props} />;

export const PerspectiveSettingsIcon = props => <Settings {...props} />;

export const FolderPropertiesIcon = props => <InfoIcon {...props} />;

export const CreateFileIcon = props => <AddIcon {...props} />;

export const LocalLocationIcon = props => <SuitcaseIcon {...props} />;
