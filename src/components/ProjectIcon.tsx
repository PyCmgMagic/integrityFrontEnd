import React from 'react';
import type { ProjectIconName } from '../utils/projectIcons';
import { getProjectIconComponent } from '../utils/projectIcons';

type ProjectIconProps = {
  name?: ProjectIconName | string;
  className?: string;
};

const ProjectIcon: React.FC<ProjectIconProps> = ({ name, className }) => {
  const Icon = getProjectIconComponent(name);
  return <Icon className={className} />;
};

export default ProjectIcon;
