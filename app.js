const express = require('express');
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

// Making instance of server
const app = express();

// Data use in json format
app.use(express.json());

// Path of database
const dbPath = path.join(__dirname, 'cricketMatchDetails.db');


// Now Initializing the database and sever
let db = null;
const InitializeDatabaseAndServer = async () => {
    try{
        db = await open({
            filename :dbPath,
            driver: sqlite3.Database
        });
        app.listen(3000, ()=> {
            console.log("Server Running at http://localhost:3000/");
        });
    }catch(error){
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    };
};


// Initiating server
InitializeDatabaseAndServer();



// Returns a list of all the players in the player table
app.get('/players/', async (req,res)=> {
    const queryForGettingPlayers = `SELECT player_id as playerId, player_name as playerName FROM player_details;`;
    try{
        const playersList = await db.all(queryForGettingPlayers);
        res.send(playersList);
    }catch(error){
        console.log(error);
        res.send("Error in getting players details");
    };
});


// Returns a specific player based on the player ID
app.get('/players/:playerId/', async (req,res) => {
    const {playerId} = req.params;
    const queryForGettingPlayer = `SELECT player_id as playerId, player_name as playerName FROM player_details WHERE playerId = ${playerId};`;
    try{
        const player = await db.get(queryForGettingPlayer);
        res.send(player);
    }catch(error){
        console.log(error);
        res.send("Error in getting player");
    };
});


// Updates the details of a specific player based on the player ID
app.put('/players/:playerId/', async (req,res) => {
    const {playerId} = req.params;
    const {playerName} = req.body;
    const queryForUpdatingPlayerName = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
    try{
        await db.run(queryForUpdatingPlayerName);
        res.send("Player Details Updated");
    }catch(error){
        console.log(error);
        res.send("Error in updating player Details");
    };
});



// Returns the match details of a specific match
app.get('/matches/:matchId/', async (req,res) => {
    const {matchId} = req.params;
    const queryForGettingMatch = `SELECT match_id as matchId, match, year FROM match_details WHERE matchId = ${matchId};`;
    try{
        const match = await db.get(queryForGettingMatch);
        res.send(match);
    }catch(error){
        console.log(error);
        res.send("Error in getting match");
    };
});


// Returns a list of all the matches of a player
app.get('/players/:playerId/matches', async (req,res) => {
    const {playerId} = req.params;
    const queryForGettingMatchs = `SELECT match_details.match_id as matchId, match_details.match as match, match_details.year as year FROM match_details JOIN player_match_score 
    ON match_details.match_id = player_match_score.match_id
    WHERE player_match_score.player_id = ${playerId};`;
    try{
        const matches = await db.all(queryForGettingMatchs);
        res.send(matches);
    }catch(error){
        console.log(error);
        res.send("Error in getting matches");
    };
});


//  Returns a list of players of a specific match

app.get('/matches/:matchId/players', async (req,res) => {
    const {matchId} = req.params;
    const queryForGettingPlayers = `SELECT pd.player_id as playerId, pd.player_name as playerName
    FROM player_details as pd JOIN player_match_score as pms
    ON pd.player_id = pms.player_id
    WHERE pms.match_id = ${matchId};`;
    try{
        const players = await db.all(queryForGettingPlayers);
        res.send(players);
    }catch(error){
        console.log(error);
        res.send("Error in getting players");
    };
});

// Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get('/players/:playerId/playerScores', async (req,res)=> {
    const {playerId} = req.params;
    const query = `SELECT pd.player_id as playerId, pd.player_name as playerName,
    SUM(pms.score) as totalScore, SUM(pms.fours) as totalFours, SUM(pms.sixes) as totalSixes
    FROM player_match_score as pms
    JOIN player_details as pd ON pd.player_id = pms.player_id;
    WHERE pd.player_id = ${playerId};`;
    try{
        const statisticalData = await db.all(query);
        res.send(statisticalData);
    }catch(error){
        console.log(error);
        res.send("Error in getting statisticalData");
    };
});

module.exports = app;




