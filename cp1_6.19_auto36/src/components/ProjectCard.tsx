import { Project, STATUS_COLORS, STATUS_LABELS } from '../types';
import { getTechColor } from '../utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const statusStyle = STATUS_COLORS[project.status];

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-card-header">
        <h3 className="project-card-title">{project.name}</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>
      <p className="project-card-desc">{project.description}</p>
      <div className="tech-tags">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="tech-tag"
            style={{ backgroundColor: getTechColor(tech) }}
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="project-card-footer">
        {project.githubUrl ? (
          <a
            className="github-link"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="GitHub 仓库"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        ) : (
          <div />
        )}
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          {project.createdAt ? new Date(project.createdAt).toLocaleDateString('zh-CN') : ''}
        </span>
      </div>
    </div>
  );
}
