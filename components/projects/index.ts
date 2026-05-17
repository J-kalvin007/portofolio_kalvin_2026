/**
 * @file index.ts
 * @description Barrel exports pour le module projets.
 * Centralise tous les exports pour des imports propres : `import { ProjectsGrid, ProjectModal } from '@/components/projects'`
 */

export { default as ProjectCard } from './ProjectCard';
export { default as ProjectsGrid } from './ProjectsGrid';
export { default as DisintegrationOverlay } from './DisintegrationOverlay';
export { default as ProjectModal } from './modal/ProjectModal';
export { default as StarField } from './modal/StarField';
export { default as ImageCarousel } from './modal/ImageCarousel';
export { default as DescriptionRain } from './modal/DescriptionRain';
export { default as TechStackRain } from './modal/TechStackRain';
