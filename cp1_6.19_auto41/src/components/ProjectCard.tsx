import React from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const TECH_COLORS: Record<string, string> = {
  React: '#61DAFB', Vue: '#42B883', Angular: '#DD0031', Svelte: '#FF3E00',
  'Next.js': '#000000', 'Node.js': '#339933', Express: '#000000',
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Go: '#00ADD8', Rust: '#000000', MongoDB: '#47A248', PostgreSQL: '#4169E1',
  MySQL: '#4479A1', Redis: '#DC382D', Docker: '#2496ED', TailwindCSS: '#06B6D4',
  GraphQL: '#E10098', Vite: '#646CFF', 'React Native': '#61DAFB',
  Nuxt: '#00DC82', Koa: '#33333D', Fastify: '#000000', NestJS: '#E0234E',
  Swift: '#F05138', Kotlin: '#7F52FF', Flutter: '#02569B', Electron: '#47848F',
  Sass: '#CC6699', Less: '#1D365D', Webpack: '#8DD6F9',
  AWS: '#FF9900', Vercel: '#000000', Netlify: '#00C7B7',
  SQLite: '#003B57', WebSocket: '#F7941D', 'REST API': '#6366F1',
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  '构思中': { bg: '#F1F5F9', text: '#64748B' },
  '开发中': { bg: '#DBEAFE', text: '#3B82F6' },
  '已发布': { bg: '#DCFCE7', text: '#16A34A' },
  '已归档': { bg: '#FEF9C3', text: '#CA8A04' },
};

export default function ProjectCard({ project }: { project: Project }) {
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES['构思中'];

  return (
    <Link
      to={`/projects/${project.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          border: '1px solid #F1F5F9',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px',
          }}
        >
          <h3
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#1E293B',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '70%',
            }}
          >
            {project.name}
          </h3>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              background: statusStyle.bg,
              color: statusStyle.text,
              whiteSpace: 'nowrap',
            }}
          >
            {project.status}
          </span>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            lineHeight: 1.5,
            marginBottom: '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {project.description || '暂无描述'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {project.techStack.slice(0, 5).map((tag) => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
                background: TECH_COLORS[tag] || '#3B82F6',
              }}
            >
              {tag}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B',
                background: '#F1F5F9',
              }}
            >
              +{project.techStack.length - 5}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {project.githubUrl ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: '#94A3B8',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </span>
          ) : (
            <span />
          )}
          <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
            {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>
    </Link>
  );
}
