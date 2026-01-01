import express from "express";
import {createServer} from "http";

import {Server} from "socket.io";

import cors from "cors";




const app= express();

const httpServer= createServer(app);


const  io = new Server(httpServer,{
        cors:{
                origin: "*",
                methods:["GET","POST"]
        }
})


app.use(cors());

app.use(express.json());



async function translateText(sentence, targetLanguage ="es"){


        if(!sentence || sentence.trim().length === 0){
                throw new Error("Text is required");
        }

        const sourceLanguage ="en";


        const encodedText = encodeURIComponent(sentence);

        const apiUrl =`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}`;

        try {

                const response= await fetch(apiUrl);

                if(!response.ok){
                        throw new Error(`Translation API Error : ${response.status} ${response.statusText}`)
                }

                const data= await response.json();


                console.log("result", JSON.stringify(data))
                if(data.responseData && data.responseData.translatedText){

                        return data.responseData.translatedText
                }else{
                        throw new Error("Translation API Error: No translation found")
                }
                
        } catch (error) {
                
                console.error("Translation API Error", error.message)
                throw error;
        }





}




io.on("connection",(socket)=>{
        console.log("Client Connected", socket.id);

        socket.on("translate",async(data)=>{
                console.log("Translation requested:", data);

                const {sentence, targetLanguage}= data;

                if(!sentence || sentence.trim().length === 0){
                        socket.emit("translation-error",{error:"Empty sentence received"});
                        return;
                }

                try {

                        console.log("Translating sentence:", sentence);

                        const translation = await translateText(sentence, targetLanguage);

                        console.log("Translation:", translation);

                        socket.emit("translation",{
                                original:sentence,
                                translated:translation,
                                timestamp:new Date().toISOString()
                        });
                        
                } catch (error) {
                        console.error("Error translating sentence:", error);
                        socket.emit("translation-error",{error:"Error translating sentence"});
                }

        });


socket.on("disconnect",()=>{
        console.log("Client Disconnected", socket.id);
})
});




const PORT = process.env.PORT || 3000;


httpServer.listen(PORT,()=>{


        console.log(`Server is running on port ${PORT}`);

        console.log("Socket.io server is running");
})






