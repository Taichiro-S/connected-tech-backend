import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { createDriver } from './service/neo4j'
import { Topic, Publication, User, Article, NodeType } from './types/graph'

type Env = {
  NEO4J_URI: string
  NEO4J_USER: string
  NEO4J_PASSWORD: string
}

const app = new Hono<{ Bindings: Env }>()

const getEnv = (c: any): Env => {
  // 開発環境（bun）の場合
  if (Bun.env.NODE_ENV=='development') {
    return {
      NEO4J_URI: Bun.env.NEO4J_URI || '',
      NEO4J_USER: Bun.env.NEO4J_USER || '',
      NEO4J_PASSWORD: Bun.env.NEO4J_PASSWORD || ''
    }
  }

  // Cloudflare Workers環境（staging/production）の場合
  if (!c.env.NEO4J_URI || !c.env.NEO4J_USER || !c.env.NEO4J_PASSWORD || !c.env.NODE_ENV) {
    throw new Error('Required environment variables are not set in Cloudflare Workers')
  }
  return {
    NEO4J_URI: c.env.NEO4J_URI,
    NEO4J_USER: c.env.NEO4J_USER,
    NEO4J_PASSWORD: c.env.NEO4J_PASSWORD,
  }
}

app.use('*', async (c, next) => {
  await next()
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
})

app.use('/api/*', cache({
  cacheName: 'graph-api',
  cacheControl: 'max-age=300',
}))

app.get('/api/nodes/:type', async (c) => {
  const env = getEnv(c) 
  const nodeType = c.req.param('type') as NodeType
  const driver = createDriver(env)
  const session = driver.session()
  
  
  
  try {
    let query: string
    switch (nodeType) {
      case 'Topic':
        query = `
          MATCH (n:Topic)
          RETURN n
          ORDER BY n.created_at DESC
          LIMIT 20
        `
        break
      case 'Publication':
        query = `
          MATCH (n:Publication)
          RETURN n
          ORDER BY n.created_at DESC
          LIMIT 20
        `
        break
      case 'User':
        query = `
          MATCH (n:User)
          RETURN n
          LIMIT 20
        `
        break
      case 'Article':
        query = `
          MATCH (n:Article)
          RETURN n
          ORDER BY n.published_at DESC
          LIMIT 20
        `
        break
      default:
        return c.json({ error: 'Invalid node type' }, 400)
    }

    const result = await session.run(query)
    const records = result.records.map(record => {
      const node = record.get('n').properties
      return {
        data: {
          ...node,
          id: record.get('n').identity.toString()
        }
      }
    })
    
    return c.json({ elements: { nodes: records, edges: [] } })
  } catch (error) {
    return c.json({ error: 'Failed to fetch data' }, 500)
  } finally {
    await session.close()
    await driver.close()
  }
})

export default app