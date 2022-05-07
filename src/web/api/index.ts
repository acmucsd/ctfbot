import express from 'express';
import { Ctf } from '../../database/models/Ctf';
import { Scoreboard } from '../../database/models/Scoreboard';

export const apiRouter = express.Router();

apiRouter.get('/ctf/:ctfId/ctftime', (req, res) => {
  Ctf.findByPk(req.params.ctfId, { include: Scoreboard })
    .then(async (ctf) => {
      if (!ctf || !ctf.Scoreboards || ctf.Scoreboards.length === 0) {
        return res.sendStatus(404);
      }
      const teamData = await ctf.Scoreboards[0].getTeamData();
      res.send({
        standings: teamData.map((team, i) => ({ pos: 1 + i, team: team.name, score: parseInt(String(team.points)) })),
      });
    })
    .catch(() => {
      res.sendStatus(404);
    });
});
