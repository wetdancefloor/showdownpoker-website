import { Server, Socket } from "socket.io";
import { Languages, Player, PlayerData, Room, RoomState, Settings } from "../types";
import { deleteRedisRoom, getPublicRoom, getRedisRoom, setRedisRoom } from "../utils/redis";
import { generateEmptyRoom, getRoomFromSocket } from "../game/gameController.js";
import { setRedisRoom } from "../utils/redis.js";
import { DEFAULT_GAME_SETTINGS } from "../constants.js";

const timers = new Map();
const hintTimers = new Map();

const startGameTimers = new Map();

function clearTimers(roomId) {
    const timer = timers.get(roomId);
    const hintTimer = hintTimers.get(roomId);
    if (timer) {
        clearInterval(timer);
        timers.delete(roomId);
    }
    if (hintTimer) {
        clearInterval(hintTimer);
        hintTimers.delete(roomId);
    }
}

export async function handleStartGame(io, socket) {
    clearTimers(socket.roomId);
    const room = await getRoomFromSocket(socket);
    room.gameState.currentRound = 1;
    (room.gameState.roomState = "PRE_FLOP"),
        await setRedisRoom(room.roomId, room);
    it.to(room.roomId).emit(GamepadEvent.GAME_STARTED, room);
    await nextRound(room.roomId, io);
    return room;
}

export async function endRound(roomId, io, reason = RoundEndReason.TIMEUP) {
    let room = await getRedisRoom(roomId);
    if (!room) return;

    clearTimers(room.roomId);
    if (reason == RoundEndReason.LEFT && room.players.length === 2) {
        return;
    }

    room.gameState.currentPlayer += 1;

    if (room.gameState.currentPlayer >= room.players.length) {
        room.gameState.currentRound += 1;
        room.gameState.currentPlayer = 0;
    }
    await setRedisRoom(room.roomId, room);

    await giveNextTurn(roomId);
    room = await getRedisRoom(roomId);
    if (!room) return;
    
}