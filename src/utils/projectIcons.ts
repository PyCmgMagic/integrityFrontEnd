import type React from 'react';
import {
  BookOutlined,
  ExperimentOutlined,
  StarOutlined,
  TrophyOutlined,
  RocketOutlined,
  FireOutlined,
  GiftOutlined,
  CompassOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import SportIcon from '../assets/project-icons/SportIcon';
import TimeIcon from '../assets/project-icons/TimeIcon';

export type ProjectIconName =
  | 'BookOutlined'
  | 'HeartOutlined'
  | 'ExperimentOutlined'
  | 'StarOutlined'
  | 'TrophyOutlined'
  | 'RocketOutlined'
  | 'FireOutlined'
  | 'GiftOutlined'
  | 'CompassOutlined'
  | 'Sport'
  | 'Time';

export type ProjectIconOption = {
  name: ProjectIconName;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

export const PROJECT_ICON_OPTIONS: ProjectIconOption[] = [
  { name: 'BookOutlined', label: 'Book', Icon: BookOutlined },
  { name: 'ExperimentOutlined', label: 'Experiment', Icon: ExperimentOutlined },
  { name: 'StarOutlined', label: 'Star', Icon: StarOutlined },
  { name: 'TrophyOutlined', label: 'Trophy', Icon: TrophyOutlined },
  { name: 'RocketOutlined', label: 'Rocket', Icon: RocketOutlined },
  { name: 'FireOutlined', label: 'Fire', Icon: FireOutlined },
  { name: 'GiftOutlined', label: 'Gift', Icon: GiftOutlined },
  { name: 'CompassOutlined', label: 'Compass', Icon: CompassOutlined },
  { name: 'Sport', label: 'Sport', Icon: SportIcon },
  { name: 'Time', label: 'Time', Icon: TimeIcon },
  { name: 'HeartOutlined', label: 'heart', Icon: HeartOutlined },
];

export const DEFAULT_PROJECT_ICON_NAME: ProjectIconName = PROJECT_ICON_OPTIONS[0].name;

const projectIconMap = new Map<ProjectIconName, ProjectIconOption>(
  PROJECT_ICON_OPTIONS.map((option) => [option.name, option])
);

export const getProjectIconOption = (iconName?: string) => {
  const resolvedName = (iconName as ProjectIconName) || DEFAULT_PROJECT_ICON_NAME;
  return projectIconMap.get(resolvedName) ?? projectIconMap.get(DEFAULT_PROJECT_ICON_NAME);
};

export const getProjectIconComponent = (iconName?: string) => {
  const option = getProjectIconOption(iconName);
  return option?.Icon ?? BookOutlined;
};
