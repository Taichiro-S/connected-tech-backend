import neo4j from 'neo4j-driver'

export function createDriver(env: Env) {
  const driver = neo4j.driver(
    env.NEO4J_URI,
    neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
  )
  return driver
}

interface Env {
  NEO4J_URI: string
  NEO4J_USER: string
  NEO4J_PASSWORD: string
}