import {WebSocketServer} from "ws";
import { RoomManager } from "./roomManager.js";

export class WSServer{
    private wss;
    private roomManager = new RoomManager();

    constructor(port :number){
        this.wss = new WebSocketServer({port});
        this.init();
    }

    private init(){
        this.wss.on("connection", (ws)=>{
            ws.on("message",(msg)=> {
                const data  = JSON.parse(msg.toString());

                if(data.type ==="join"){
                    this.roomManager.join(data.chatId, ws);
                }
                if(data.type ==="messaage"){
                    this.roomManager.broadcast(data.chatId, data);
                }
            });
        });
    }
}