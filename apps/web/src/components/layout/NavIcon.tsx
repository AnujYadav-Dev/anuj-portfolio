'use client';

import * as React from 'react';
import {
  Sparkles,
  FolderGit2,
  GitBranch,
  Cpu,
  BookOpen,
  FileText,
  Activity,
  Terminal,
  Mail,
  User,
  Calendar,
  ExternalLink,
  Code,
  Briefcase,
  Award,
  Layers,
  Zap,
  Globe,
  Compass,
  FileCode,
  HelpCircle,
  Hash,
  Link as LinkIcon,
  type LucideProps,
} from 'lucide-react';
import { GitHubIcon } from '@/components/common/Icons';

const ICON_MAP: Record<string, React.ComponentType<React.SVGAttributes<SVGSVGElement>>> = {
  sparkles: Sparkles,

  'folder-git-2': FolderGit2,
  folder: FolderGit2,
  'git-branch': GitBranch,
  git: GitBranch,
  cpu: Cpu,
  'book-open': BookOpen,
  book: BookOpen,
  'file-text': FileText,
  document: FileText,
  activity: Activity,
  terminal: Terminal,
  mail: Mail,
  'file-user': User,
  user: User,
  github: GitHubIcon,
  calendar: Calendar,
  'external-link': ExternalLink,
  code: Code,
  briefcase: Briefcase,
  award: Award,
  layers: Layers,
  zap: Zap,
  globe: Globe,
  compass: Compass,
  'file-code': FileCode,
  help: HelpCircle,
  hash: Hash,
  link: LinkIcon,
};

export interface NavIconProps extends Omit<LucideProps, 'name'> {
  name?: string | null;
}

export function NavIcon({ name, ...props }: NavIconProps) {
  if (!name) return null;
  const normalizedKey = name.toLowerCase().trim();
  const IconComponent = ICON_MAP[normalizedKey] || LinkIcon;
  return <IconComponent {...props} />;
}

