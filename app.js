const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')

const app = express()
app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      fileName: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const covertObject = dbObject => {
  return {
    playerid: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = ` 
  SELECT 
   *
  FROM
   cricket_team`

  const playerList = await db.all(getPlayersQuery)
  response.send(playerList.map(eachPlayer => covertObject(eachPlayer)))
})

app.get('/players/:player_id/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT 
   *
  FROM
   cricket_team
  WHERE 
   player_id = ${playerId}`

  const player = await db.get(getPlayerQuery)
  response.send(convertObject(player))
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO 
   cricket_team(player_name,jersey_number,role)
  VALUES
   ('${playerName}',${jerseyNumber},'${role}')`

  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:player_id/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE  
   cricket_team
  SET
   (player_name='${playerName}',jerse_number=${jerseyNumber},role='${role}')
  WHERE 
   player_id = ${playerId}`

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:player_id/', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
  DELETE FROM  
   cricket_team
  WHERE 
   player_id = ${playerId}`

  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
