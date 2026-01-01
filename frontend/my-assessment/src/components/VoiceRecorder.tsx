/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client';


interface TranslationType {
        original: string,
        translated: string,
        timestamp: string
}
const VoiceRecorder = () => {

        const [isRecording, setIsRecording] = useState<boolean>(false)

        const [translation, setTranslation] = useState<TranslationType[]>([])

        const [pendingTranslation, setPendingTranslation] = useState<Set<string>>(new Set())

        const [sentence, setSentence] = useState<string>("");

        const [error, setError] = useState<string | null>(null);

        const [socket, setSocket] = useState<Socket | null>(null);


        const [isConnected, setIsConnected] = useState<boolean>(false);


        const recognitionRef = useRef<any | null>(null)

        const mediaRecorderRef = useRef<MediaRecorder | null>(null)







        useEffect(() => {


                const newSocket = io("http://localhost:3000", {
                        transports: ["websocket", "polling"]
                });


                newSocket.on("connect", () => {
                        setIsConnected(true);
                        setError(null);

                });



                newSocket.on("disconnect", () => {
                        setIsConnected(false);

                });


                newSocket.on("translation", (data: any) => {

                        console.log("Translation received:", data);
                        setTranslation((prev) => [...prev, data]);


                        setPendingTranslation((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(data.original);
                                return newSet;
                        })


                        setSentence("");


                });

                setSocket(newSocket)






                return () => {
                        newSocket.close();
                }
        }, [])



        useEffect(() => {

                if (!isRecording) {
                        return
                }

                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                        console.log("Speech recognition is not supported in this browser.");
                        setError("Speech recognition is not supported in this browser.");
                        return;
                }

                console.log("Speech recognition is supported in this browser.");


                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;


                const recognition = new SpeechRecognition();

                recognition.continuous = true;


                recognition.interimResults = true;


                recognition.lang = "en-US";

                recognition.onresult = (event: any) => {

                        let interimTranscript = "";
                        let finalTranscript = "";

                        console.log(event, 'liine156')
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                                const transcript = event.results[i][0].transcript;

                                console.log("Transcript 12:", transcript);
                                if (event.results[i].isFinal) {
                                        console.log("Final transcript 12:", transcript);
                                        finalTranscript += transcript + " ";
                                } else {
                                        console.log("Interim transcript 12:", transcript);
                                        interimTranscript += transcript;
                                }
                        }


                        if (finalTranscript.trim()) {

                                const sentence = finalTranscript.trim();
                                setSentence(sentence);

                                if (socket && isConnected) {
                                        setPendingTranslation((prev) => {

                                                const newSet = new Set(prev);
                                                newSet.add(sentence);
                                                return newSet
                                        })

                                        console.log("Sending translation request for:", sentence);
                                        socket.emit("translate", {
                                                sentence: sentence,
                                                targetLanguage: "es"
                                        })

                                }
                        } else if (interimTranscript) {
                                setSentence(interimTranscript);
                        }
                }


                recognition.onerror = (event: any) => {
                        setError("Speech recognition error: " + event.error);
                }

                recognition.onend = () => {
                        if (isRecording) {
                                try {
                                        recognition.start()
                                } catch (error) {
                                        setError("Error restarting recognition: " + error);
                                }
                        }
                }
                recognitionRef.current = recognition;



                return () => {
                        if (recognitionRef.current) {
                                recognitionRef.current.stop();
                        }
                }
        }, [socket, isRecording, isConnected])




        const startRecording = async () => {
                try {
                        setError(null);
                        setTranslation([]);
                        setSentence("");


                        await navigator.mediaDevices.getUserMedia({ audio: true });

                        if (recognitionRef.current) {
                                recognitionRef.current.start();
                        }


                        setIsRecording(true)


                } catch (error) {
                        console.log("Error starting recording", error);
                        setError("Failed to access microphone. Please check your browser permissions.");
                }
        }
        const stopRecording = () => {

                if (recognitionRef.current) {
                        recognitionRef.current = null
                }

                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {

                        mediaRecorderRef.current = null
                }



                setIsRecording(false)
                setSentence("");
        }




        return (
                <div>
                        <div>
                                <span>{isConnected ? "Connected to Server" : "Disconnected from Server"}</span>
                        </div>

                        <div >
                                <button onClick={isRecording ? stopRecording : startRecording} disabled={!isConnected} >

                                        {isRecording ? "Stop Recording" : "Start Recording"}
                                </button>
                        </div>
                        {error && (
                                <div>
                                        {error}
                                </div>
                        )}

                        {
                                sentence && (
                                        <div>
                                                <p>Speaking:</p>
                                                <p>{sentence}</p>
                                        </div>
                                )
                        }

                        <div>
                                <h2>Translations</h2>

                                {
                                        translation.length === 0 && pendingTranslation.size === 0 ? (
                                                <p>No Translations yet. Start Recording to see translations appear here</p>
                                        ) : (
                                                <div>
                                                        {
                                                                translation.map((translation, index) => (
                                                                        <div key={index}>
                                                                                <div>
                                                                                        <strong>Original:</strong>{translation.original}
                                                                                </div>
                                                                                <div>
                                                                                        <strong>Translated:</strong>{translation.translated}
                                                                                </div>
                                                                        </div>
                                                                ))
                                                        }


                                                        {
                                                                Array.from(pendingTranslation).map((sentence, index) => (
                                                                        <div key={index}>
                                                                                <p>Pending Translation:</p>
                                                                                <p>{sentence}</p>
                                                                        </div>
                                                                ))
                                                        }
                                                </div>
                                        )
                                }
                        </div>
                </div>
        )
}

export default VoiceRecorder