import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraCapture({ photo, onChange }) {
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cargar dispositivos de video disponibles
  useEffect(() => {
    async function getDevices() {
      try {
        // Solicitar permisos primero para poder listar nombres de dispositivos
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(t => t.stop()); // Detener inmediatamente

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error al listar dispositivos de video:', err);
        setError('No se pudo acceder a la cámara o permisos denegados.');
      }
    }
    getDevices();
  }, []);

  // Iniciar la cámara cuando isActive o selectedDeviceId cambia
  useEffect(() => {
    if (isActive && selectedDeviceId) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, selectedDeviceId]);

  async function startCamera() {
    stopCamera();
    setError(null);
    try {
      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error al iniciar la cámara:', err);
      setError('Error al conectar con el dispositivo seleccionado.');
      setIsActive(false);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  function handleCapture() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Capturar en formato cuadrado (400x400)
      const size = 400;
      canvas.width = size;
      canvas.height = size;
      
      // Calcular encuadre centrado (crop a cuadrado)
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const minDimension = Math.min(videoWidth, videoHeight);
      
      const sx = (videoWidth - minDimension) / 2;
      const sy = (videoHeight - minDimension) / 2;
      
      ctx.drawImage(
        video,
        sx, sy, minDimension, minDimension, // Origen crop
        0, 0, size, size // Destino
      );
      
      const base64Data = canvas.toDataURL('image/jpeg', 0.9);
      onChange(base64Data);
      setIsActive(false); // Detener stream tras capturar
    }
  }

  function handleClear() {
    onChange(null);
    setIsActive(false);
  }

  return (
    <div className="camera-capture-container" style={{ margin: '14px 0' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Lado Izquierdo: Vista previa (Foto capturada o Video en vivo o Silueta) */}
        <div style={{
          width: 140,
          height: 140,
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--color-border)',
          background: 'var(--color-bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {isActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // Efecto espejo para el usuario
              }}
            />
          ) : photo ? (
            <img
              src={photo}
              alt="Paciente Capturado"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 10 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, marginBottom: 4 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div style={{ fontSize: 11, fontWeight: 500 }}>Sin Foto</div>
            </div>
          )}

          {/* Estado Live indicador */}
          {isActive && (
            <span style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'var(--color-danger)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              animation: 'pulse 1.5s infinite'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> LIVE
            </span>
          )}
        </div>

        {/* Lado Derecho: Controles de Cámara */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
          
          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* Selector de cámara si hay múltiples y está activa */}
          {isActive && devices.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Seleccionar Cámara</label>
              <select
                className="form-control"
                style={{ padding: '4px 8px', fontSize: 12.5, height: 'auto' }}
                value={selectedDeviceId}
                onChange={e => setSelectedDeviceId(e.target.value)}
              >
                {devices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Cámara ${devices.indexOf(device) + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {!isActive ? (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ gap: 6, display: 'flex', alignItems: 'center' }}
                  onClick={() => setIsActive(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  {photo ? 'Tomar Nueva Foto' : 'Activar Cámara'}
                </button>
                
                {photo && (
                  <button
                    type="button"
                    className="btn btn-danger btn-ghost btn-sm"
                    style={{ gap: 6, display: 'flex', alignItems: 'center' }}
                    onClick={handleClear}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Quitar Foto
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ gap: 6, display: 'flex', alignItems: 'center' }}
                  onClick={handleCapture}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                  Capturar Foto
                </button>
                
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ gap: 6, display: 'flex', alignItems: 'center' }}
                  onClick={() => setIsActive(false)}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Animación CSS para el badge LIVE */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
