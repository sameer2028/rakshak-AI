"""
Audio Processing Service
"""
import speech_recognition as sr
import io
from fastapi import UploadFile, HTTPException

async def extract_text_from_audio(file: UploadFile) -> str:
    """Extract text from a WAV audio file using SpeechRecognition."""
    if not file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only .wav files are supported for demo transcription.")
        
    audio_data = await file.read()
    
    # We must use io.BytesIO to simulate a file for the AudioFile class
    try:
        recognizer = sr.Recognizer()
        with sr.AudioFile(io.BytesIO(audio_data)) as source:
            # Read the entire audio file
            audio = recognizer.record(source)
            
        # Use Google Web Speech API
        text = recognizer.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Speech Recognition could not understand the audio. Please try speaking clearly.")
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Could not request results from Speech Recognition service; {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")
