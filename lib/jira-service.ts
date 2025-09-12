// Servicio para integración con Jira API

import axios, { AxiosInstance } from 'axios';

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey: string;
  lead: {
    displayName: string;
    emailAddress: string;
    avatarUrls: {
      '48x48': string;
    };
  };
  avatarUrls: {
    '48x48': string;
  };
  url: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: {
    name: string;
    statusCategory: {
      name: string;
      colorName: string;
    };
  };
  priority: {
    name: string;
    iconUrl: string;
  };
  issueType: {
    name: string;
    iconUrl: string;
  };
  assignee?: {
    displayName: string;
    emailAddress: string;
    avatarUrls: {
      '48x48': string;
    };
  };
  reporter: {
    displayName: string;
    emailAddress: string;
    avatarUrls: {
      '48x48': string;
    };
  };
  created: string;
  updated: string;
  labels: string[];
  components: Array<{
    name: string;
  }>;
  fixVersions: Array<{
    name: string;
  }>;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  location: {
    projectId: number;
    projectKey: string;
    projectName: string;
  };
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  goal?: string;
}

class JiraService {
  private client: AxiosInstance;
  private baseUrl: string;
  private isConfigured: boolean;

  constructor() {
    const host = process.env.JIRA_HOST;
    const email = process.env.JIRA_EMAIL;
    const apiToken = process.env.JIRA_API_TOKEN;

    this.isConfigured = !!(host && email && apiToken);

    if (!this.isConfigured) {
      console.warn('Jira integration not configured. Set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.');
      // Crear cliente mock para evitar errores
      this.baseUrl = '';
      this.client = axios.create();
      return;
    }

    this.baseUrl = `https://${host}`;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: email!,
        password: apiToken!,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Interceptor para logging de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Jira API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
        throw error;
      }
    );
  }

  /**
   * Verificar si la integración con Jira está disponible
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Verificar conectividad con Jira
   */
  async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client.get('/rest/api/3/myself');
      return true;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser() {
    try {
      const response = await this.client.get('/rest/api/3/myself');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get current user from Jira');
    }
  }

  /**
   * Obtener proyectos accesibles
   */
  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await this.client.get('/rest/api/3/project/search', {
        params: {
          expand: 'description,lead,issueTypes,url,projectKeys',
          maxResults: 50,
        },
      });

      return response.data.values.map((project: any) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        projectTypeKey: project.projectTypeKey,
        lead: project.lead,
        avatarUrls: project.avatarUrls,
        url: project.url || `${this.baseUrl}/browse/${project.key}`,
      }));
    } catch (error) {
      console.error('Error fetching Jira projects:', error);
      throw new Error('Failed to fetch Jira projects');
    }
  }

  /**
   * Obtener issues de un proyecto
   */
  async getProjectIssues(
    projectKey: string, 
    options: {
      maxResults?: number;
      startAt?: number;
      jql?: string;
      fields?: string[];
    } = {}
  ): Promise<{ issues: JiraIssue[]; total: number }> {
    try {
      const {
        maxResults = 50,
        startAt = 0,
        jql = `project = ${projectKey} ORDER BY created DESC`,
        fields = [
          'summary', 'description', 'status', 'priority', 'issuetype',
          'assignee', 'reporter', 'created', 'updated', 'labels',
          'components', 'fixVersions'
        ]
      } = options;

      const response = await this.client.post('/rest/api/3/search', {
        jql,
        startAt,
        maxResults,
        fields,
      });

      const issues = response.data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || issue.fields.description,
        status: issue.fields.status,
        priority: issue.fields.priority,
        issueType: issue.fields.issuetype,
        assignee: issue.fields.assignee,
        reporter: issue.fields.reporter,
        created: issue.fields.created,
        updated: issue.fields.updated,
        labels: issue.fields.labels || [],
        components: issue.fields.components || [],
        fixVersions: issue.fields.fixVersions || [],
      }));

      return {
        issues,
        total: response.data.total,
      };
    } catch (error) {
      console.error('Error fetching project issues:', error);
      throw new Error('Failed to fetch project issues');
    }
  }

  /**
   * Obtener boards de un proyecto
   */
  async getProjectBoards(projectKey: string): Promise<JiraBoard[]> {
    try {
      const response = await this.client.get('/rest/agile/1.0/board', {
        params: {
          projectKeyOrId: projectKey,
          maxResults: 20,
        },
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error fetching project boards:', error);
      throw new Error('Failed to fetch project boards');
    }
  }

  /**
   * Obtener sprints de un board
   */
  async getBoardSprints(boardId: number): Promise<JiraSprint[]> {
    try {
      const response = await this.client.get(`/rest/agile/1.0/board/${boardId}/sprint`, {
        params: {
          maxResults: 20,
        },
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error fetching board sprints:', error);
      throw new Error('Failed to fetch board sprints');
    }
  }

  /**
   * Crear un issue en Jira
   */
  async createIssue(projectKey: string, issueData: {
    summary: string;
    description?: string;
    issueType: string;
    priority?: string;
    assignee?: string;
    labels?: string[];
    components?: string[];
  }) {
    try {
      const payload = {
        fields: {
          project: { key: projectKey },
          summary: issueData.summary,
          description: issueData.description ? {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: issueData.description,
                  },
                ],
              },
            ],
          } : undefined,
          issuetype: { name: issueData.issueType },
          priority: issueData.priority ? { name: issueData.priority } : undefined,
          assignee: issueData.assignee ? { emailAddress: issueData.assignee } : undefined,
          labels: issueData.labels || [],
          components: issueData.components?.map(name => ({ name })) || [],
        },
      };

      const response = await this.client.post('/rest/api/3/issue', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating Jira issue:', error);
      throw new Error('Failed to create Jira issue');
    }
  }

  /**
   * Obtener estadísticas de un proyecto
   */
  async getProjectStats(projectKey: string) {
    try {
      const [issuesResult, boards] = await Promise.all([
        this.getProjectIssues(projectKey, { maxResults: 100 }),
        this.getProjectBoards(projectKey).catch(() => []), // Boards pueden no estar disponibles
      ]);

      const { issues } = issuesResult;

      // Calcular estadísticas
      const statusCounts = issues.reduce((acc: Record<string, number>, issue) => {
        const status = issue.status.statusCategory.name;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const priorityCounts = issues.reduce((acc: Record<string, number>, issue) => {
        const priority = issue.priority?.name || 'None';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {});

      const issueTypeCounts = issues.reduce((acc: Record<string, number>, issue) => {
        const type = issue.issueType.name;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Issues recientes (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentIssues = issues.filter(issue => 
        new Date(issue.created) > sevenDaysAgo
      );

      return {
        totalIssues: issues.length,
        statusBreakdown: statusCounts,
        priorityBreakdown: priorityCounts,
        issueTypeBreakdown: issueTypeCounts,
        recentIssues: recentIssues.length,
        boards: boards.length,
        recentActivity: recentIssues.slice(0, 5), // 5 issues más recientes
      };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw new Error('Failed to fetch project statistics');
    }
  }

  /**
   * Buscar issues con JQL personalizado
   */
  async searchIssues(jql: string, maxResults: number = 50) {
    try {
      const response = await this.client.post('/rest/api/3/search', {
        jql,
        maxResults,
        fields: [
          'summary', 'description', 'status', 'priority', 'issuetype',
          'assignee', 'reporter', 'created', 'updated', 'labels'
        ],
      });

      return {
        issues: response.data.issues,
        total: response.data.total,
      };
    } catch (error) {
      console.error('Error searching issues:', error);
      throw new Error('Failed to search issues');
    }
  }
}

// Instancia singleton
export const jiraService = new JiraService();

export default JiraService;
