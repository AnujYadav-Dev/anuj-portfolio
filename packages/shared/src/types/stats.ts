// Public statistics DTO.

export interface TechnologyStatItem {
  name: string;
  count: number;
}

export interface PublicStatsDto {
  totalProjects: number;
  totalBlogPosts: number;
  totalResearchPapers: number;
  totalSkills: number;
  totalExperiences: number;
  yearsOfExperience: number;
  totalOpenSourceRepos: number;
  totalGithubStars: number;
  totalReadingTimeMinutes?: number;
  totalWordsWritten?: number;
  totalCountriesCount?: number;
  topTechnologies?: TechnologyStatItem[];
  updatedAt: string;
}

