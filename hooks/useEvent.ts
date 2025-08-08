import { Event, EventType } from "@/src/types/eventTypes";
import { useCallback, useEffect, useState } from "react";

export const useEventQueue = () => {
  const [events, setEvents] = useState<Event[]>([]); // Estado con los eventos programados

  // Procesar un evento
  const processEvent = useCallback((event: Event) => {
    switch (event.type) {
      case "build":
        // Lógica de construcción
        console.log("Construyendo...", event.parameters);
        break;
      case "research":
        // Lógica de investigación
        console.log("Investigando...", event.parameters);
        break;
      case "attack":
        // Lógica de ataque
        console.log("Atacando...", event.parameters);
        break;
      case "collect":
        // Lógica de recolección
        console.log("Recolectando recursos...", event.parameters);
        break;
      case "move":
        // Lógica de movimiento
        console.log("Moviendo...", event.parameters);
        break;
      default:
        console.warn(`Acción desconocida: ${event.type}`);
    }
  }, []);

  const addEvent = (type: EventType, endTime: number, parameters: any) => {
    const newEvent: Event = {
      id: `${type}-${endTime}`,
      type,
      endTime,
      parameters,
    };
    setEvents((prevEvents) => [...prevEvents, newEvent].sort((a, b) => a.endTime - b.endTime));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now(); // Fecha y hora actuales

      // Filtramos y procesamos los eventos cuyo tiempo de fin ya haya pasado
      const eventsToProcess = events.filter((event) => event.endTime <= now);
      eventsToProcess.forEach((event) => {
        processEvent(event); // Ejecutamos la acción del evento
      });

      // Eliminamos los eventos que ya se procesaron
      setEvents((prevEvents) => prevEvents.filter((event) => event.endTime > now));
    }, 1000);

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar
  }, [events, processEvent]);

  return {
    events,
    addEvent,
  };
};
