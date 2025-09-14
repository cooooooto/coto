// Componente para mostrar integración con Jira

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { 
  ExternalLink, 
  Bug, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  url: string;
  lead: {
    displayName: string;
    emailAddress: string;
    avatarUrls: {
      '48x48': string;
    };
  };
}

interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: {
    name: string;
    statusCategory: {
      name: string;
      colorName: string;
    };
  };
  priority: {
    name: string;
  };
  issueType: {
    name: string;
  };
  assignee?: {
    displayName: string;
    avatarUrls: {
      '48x48': string;
    };
  };
  created: string;
}

interface JiraStats {
  totalIssues: number;
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  issueTypeBreakdown: Record<string, number>;
  recentIssues: number;
  recentActivity: JiraIssue[];
}

interface JiraIntegrationProps {
  project: Project;
  jiraProjectKey?: string;
  onJiraProjectChange?: (projectKey: string) => void;
}

export default function JiraIntegration({ 
  project, 
  jiraProjectKey, 
  onJiraProjectChange 
}: JiraIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(jiraProjectKey || '');
  const [jiraStats, setJiraStats] = useState<JiraStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<JiraIssue[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Verificar configuración de Jira al cargar
  useEffect(() => {
    checkJiraConfiguration();
  }, []);

  // Cargar proyectos cuando esté configurado
  useEffect(() => {
    if (isConfigured) {
      loadJiraProjects();
    }
  }, [isConfigured]);

  // Función para cargar datos del proyecto
  const loadProjectData = useCallback(async () => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      setError(null);

      const [statsResponse, issuesResponse] = await Promise.all([
        fetch(`/api/jira?action=project-stats&projectKey=${selectedProject}`),
        fetch(`/api/jira?action=project-issues&projectKey=${selectedProject}&maxResults=10`)
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setJiraStats(statsData.stats);
      }

      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json();
        setRecentIssues(issuesData.issues);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  // Cargar datos cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProject && isConfigured) {
      loadProjectData();
    }
  }, [selectedProject, isConfigured, loadProjectData]);

  const checkJiraConfiguration = async () => {
    try {
      const response = await fetch('/api/jira?action=test-connection');
      const data = await response.json();
      
      if (response.ok) {
        setIsConfigured(data.connected);
        if (!data.connected) {
          setError('Jira connection test failed');
        }
      } else {
        setIsConfigured(false);
        setError(data.message || 'Jira not configured');
      }
    } catch (err) {
      setIsConfigured(false);
      setError('Failed to check Jira configuration');
    }
  };

  const loadJiraProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/jira?action=projects');
      
      if (!response.ok) {
        throw new Error('Failed to load Jira projects');
      }
      
      const data = await response.json();
      setJiraProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (projectKey: string) => {
    setSelectedProject(projectKey);
    onJiraProjectChange?.(projectKey);
  };

  const getStatusColor = (statusCategory: string) => {
    switch (statusCategory.toLowerCase()) {
      case 'done':
        return 'text-green-600 dark:text-green-400';
      case 'indeterminate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'new':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
      case 'lowest':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isConfigured === null) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Jira Integration
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Checking Jira configuration...</p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Jira Integration
          </h3>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
            Configuration Required
          </h4>
          <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
            To use Jira integration, please configure the following environment variables:
          </p>
          <ul className="text-orange-700 dark:text-orange-300 text-sm space-y-1 mb-3">
            <li>• <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">JIRA_HOST</code> - Your Jira instance hostname</li>
            <li>• <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">JIRA_EMAIL</code> - Your Jira email address</li>
            <li>• <code className="bg-orange-100 dark:bg-orange-800 px-1 rounded">JIRA_API_TOKEN</code> - Your Jira API token</li>
          </ul>
          {error && (
            <p className="text-orange-600 dark:text-orange-400 text-xs">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Jira Integration
            </h3>
          </div>
          <button
            onClick={loadProjectData}
            disabled={!selectedProject || isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Project Selector */}
        <div className="mb-4">
          <label htmlFor="jira-project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Jira Project
          </label>
          <select
            id="jira-project"
            value={selectedProject}
            onChange={(e) => handleProjectSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a project...</option>
            {jiraProjects.map((proj) => (
              <option key={proj.key} value={proj.key}>
                {proj.key} - {proj.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      {jiraStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Issues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{jiraStats.totalIssues}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Issues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{jiraStats.recentIssues}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Done</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {jiraStats.statusBreakdown['Done'] || 0}
            </p>
          </div>
        </div>
      )}

      {/* Recent Issues */}
      {recentIssues.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Issues</h4>
          <div className="space-y-3">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(issue.priority.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {issue.key}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(issue.status.statusCategory.name)}`}>
                      {issue.status.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                    {issue.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{issue.issueType.name}</span>
                    <span>•</span>
                    <span>{new Date(issue.created).toLocaleDateString()}</span>
                    {issue.assignee && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{issue.assignee.displayName}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedProject && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={`https://${process.env.NEXT_PUBLIC_JIRA_HOST || 'your-domain.atlassian.net'}/browse/${selectedProject}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View in Jira
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
