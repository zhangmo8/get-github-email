export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  html_url: string
}

export interface GitHubCommit {
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
  }
}

export interface GitHubEvent {
  type: string
  payload: {
    commits?: Array<{
      author: {
        name: string
        email: string
      }
    }>
  }
}

export class GitHubEmailFinder {
  private readonly baseUrl = 'https://api.github.com'

  async getUserInfo(username: string): Promise<GitHubUser> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Email-Finder-Extension',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)

        if (response.status === 404) {
          throw new Error(`User "${username}" not found`)
        }
        if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later.')
        }
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`)
      }

      const userData = await response.json()
      return userData
    }
    catch (error) {
      console.error('Error in getUserInfo:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred while fetching user info')
    }
  }

  async getUserEmails(username: string): Promise<string[]> {
    const emails = new Set<string>()
    let userRealName = ''

    try {
      // Method 1: Check user profile email
      const user = await this.getUserInfo(username)
      if (user.email) {
        emails.add(user.email)
      }

      userRealName = user.name || ''

      // Method 2: Check public events
      const eventEmails = await this.getEmailsFromEvents(username, userRealName)
      eventEmails.forEach(email => emails.add(email))
    }
    catch (error) {
      console.error('Error fetching emails:', error)
    }

    // Filter out noreply emails and invalid emails
    const validEmails = Array.from(emails).filter(email =>
      email
      && !email.includes('noreply')
      && email.includes('@')
      && !email.includes('users.noreply.github.com'),
    )

    return validEmails
  }

  private async getEmailsFromEvents(username: string, userRealName: string = ''): Promise<string[]> {
    const emails = new Set<string>()

    try {
      const eventsResponse = await fetch(`${this.baseUrl}/users/${username}/events/public?per_page=30`)
      if (!eventsResponse.ok)
        return []

      const events: GitHubEvent[] = await eventsResponse.json()

      events.forEach((event) => {
        if (event.type === 'PushEvent' && event.payload.commits) {
          event.payload.commits.forEach((commit) => {
            const authorName = commit.author.name
            const authorEmail = commit.author.email

            if (authorEmail
              && (authorName === username
              || (userRealName && authorName === userRealName)
              || authorEmail.toLowerCase().includes(username.toLowerCase()))) {
              emails.add(authorEmail)
            }
          })
        }
      })
    }
    catch (error) {
      console.error('Error fetching emails from events:', error)
    }

    return Array.from(emails)
  }
}

/*
 * 获取GitHub用户的邮箱地址
 * 修复问题：只获取目标用户的邮箱，不包括合作者的邮箱
 *
 * 策略：
 * 1. 获取用户资料中的公开邮箱
 * 2. 从用户仓库的提交记录中获取（API已过滤为该用户的提交）
 * 3. 从用户的公开事件中获取（需要验证提交者身份）
 */

export const githubEmailFinder = new GitHubEmailFinder()
