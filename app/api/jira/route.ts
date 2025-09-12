// API Route para integración con Jira

import { NextRequest, NextResponse } from 'next/server';
import { jiraService } from '@/lib/jira-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!jiraService.isAvailable()) {
      return NextResponse.json(
        { 
          error: 'Jira integration is not configured',
          message: 'Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN environment variables'
        },
        { status: 503 }
      );
    }

    switch (action) {
      case 'test-connection':
        const isConnected = await jiraService.testConnection();
        return NextResponse.json({ 
          connected: isConnected,
          message: isConnected ? 'Connection successful' : 'Connection failed'
        });

      case 'user':
        const user = await jiraService.getCurrentUser();
        return NextResponse.json({ user });

      case 'projects':
        const projects = await jiraService.getProjects();
        return NextResponse.json({ projects });

      case 'project-issues':
        const projectKey = searchParams.get('projectKey');
        const maxResults = parseInt(searchParams.get('maxResults') || '50');
        const startAt = parseInt(searchParams.get('startAt') || '0');
        const jql = searchParams.get('jql');

        if (!projectKey) {
          return NextResponse.json(
            { error: 'Project key is required' },
            { status: 400 }
          );
        }

        const issuesResult = await jiraService.getProjectIssues(projectKey, {
          maxResults,
          startAt,
          jql: jql || undefined,
        });
        return NextResponse.json(issuesResult);

      case 'project-stats':
        const statsProjectKey = searchParams.get('projectKey');
        
        if (!statsProjectKey) {
          return NextResponse.json(
            { error: 'Project key is required' },
            { status: 400 }
          );
        }

        const stats = await jiraService.getProjectStats(statsProjectKey);
        return NextResponse.json({ stats });

      case 'project-boards':
        const boardsProjectKey = searchParams.get('projectKey');
        
        if (!boardsProjectKey) {
          return NextResponse.json(
            { error: 'Project key is required' },
            { status: 400 }
          );
        }

        const boards = await jiraService.getProjectBoards(boardsProjectKey);
        return NextResponse.json({ boards });

      case 'board-sprints':
        const boardId = searchParams.get('boardId');
        
        if (!boardId) {
          return NextResponse.json(
            { error: 'Board ID is required' },
            { status: 400 }
          );
        }

        const sprints = await jiraService.getBoardSprints(parseInt(boardId));
        return NextResponse.json({ sprints });

      case 'search':
        const searchJql = searchParams.get('jql');
        const searchMaxResults = parseInt(searchParams.get('maxResults') || '50');
        
        if (!searchJql) {
          return NextResponse.json(
            { error: 'JQL query is required' },
            { status: 400 }
          );
        }

        const searchResult = await jiraService.searchIssues(searchJql, searchMaxResults);
        return NextResponse.json(searchResult);

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            supportedActions: [
              'test-connection',
              'user',
              'projects',
              'project-issues',
              'project-stats',
              'project-boards',
              'board-sprints',
              'search'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Jira API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Jira API error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!jiraService.isAvailable()) {
      return NextResponse.json(
        { 
          error: 'Jira integration is not configured',
          message: 'Please set JIRA_HOST, JIRA_EMAIL, and JIRA_API_TOKEN environment variables'
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    switch (action) {
      case 'create-issue':
        const { projectKey, issueData } = body;
        
        if (!projectKey || !issueData) {
          return NextResponse.json(
            { error: 'Project key and issue data are required' },
            { status: 400 }
          );
        }

        const createdIssue = await jiraService.createIssue(projectKey, issueData);
        return NextResponse.json({ issue: createdIssue });

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            supportedActions: ['create-issue']
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Jira API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Jira API error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
