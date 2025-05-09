import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import axios from 'axios';

const Calendrier: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
      fetchEvents();
    }, []);

  // Récupérer les informations de l'utilisateur depuis le localStorage et les événements
  /*const fetchEvents = () => {
    const token = localStorage.getItem("user");
    axios.get(`${import.meta.env.VITE_APP_API_URL}/api/calendrier`, {
      headers: { Authorization: `Bearer ${userData.token}` }
    })
    .then(response => {
      const formattedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.event,
        start: event.date,  // Assurez-vous que "date" est bien au format YYYY-MM-DD
        extendedProps: {
          created_by: event.created_by || event.nom_complet,
        },
      }));
      setEvents(formattedEvents);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des événements :', error);
    });
  }; */   

  // Gérer la création d'un nouvel événement
  const handleDateClick = async (info: any) => {
  try {
    const token = userData.token || localStorage.getItem("user");
    if (!token) {
      alert("Authentification requise");
      return;
    }

    if (!userData?.nom_complet) {
      alert("Information utilisateur manquante");
      return;
    }

    const eventTitle = prompt("Entrez le titre de l'événement :");
    if (!eventTitle) return;

    const response = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/api/calendrier`,
      {
        event: eventTitle, // Utilisez 'event' au lieu de 'title'
        date: info.dateStr,
        created_by: userData.nom_complet,
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const newEvent = {
      id: response.data.id,
      title: response.data.event, // Mappez correctement le champ 'event' en 'title'
      start: response.data.date,
      extendedProps: {
        created_by: response.data.created_by,
      },
    };

    setEvents(prev => [...prev, newEvent]);
  } catch (error) {
    console.error("Erreur création événement:", error);
    alert(error.response?.data?.error || "Erreur lors de la création");
  }
};
  
const fetchEvents = () => {
  axios.get(`${import.meta.env.VITE_APP_API_URL}/api/calendrier`, {
    headers: { Authorization: `Bearer ${userData.token}` }
  })
  .then(response => {
    const formattedEvents = response.data.map((event: any) => ({
      id: event.id_event, // Utilisez id_event au lieu de id
      title: event.event,
      start: event.date,
      extendedProps: {
        created_by: event.created_by,
        id_event: event.id_event // Ajoutez explicitement id_event
      },
    }));
    setEvents(formattedEvents);
  })
  .catch(error => {
    console.error('Erreur:', error);
  });
};

const handleEventClick = async (info: any) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    if (!user?.token) {
      alert('Connectez-vous');
      return;
    }

    // Utilisez info.event.extendedProps.id_event
    const eventId = info.event.extendedProps.id_event || info.event.id;
    if (!eventId) {
      console.error('ID manquant:', info.event);
      return;
    }

    if (window.confirm(`Supprimer "${info.event.title}" ?`)) {
      await axios.delete(
        `${import.meta.env.VITE_APP_API_URL}/api/calendrier/${eventId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setEvents(prev => prev.filter(e => 
        (e.extendedProps.id_event || e.id) !== eventId
      ));
      alert('Supprimé avec succès');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert(error.response?.data?.error || 'Erreur lors de la suppression');
  }
};
  

  const renderEventContent = (eventInfo: any) => {
    return (
      <div>
        <b>{eventInfo.event.title}</b>
        <br />
        <i>Créé par: {eventInfo.event.extendedProps.created_by}</i>
      </div>
    );
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-bold mb-4">Calendrier des événements</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable
        selectable
        eventContent={renderEventContent}
      />
    </div> 
  );
};

export default Calendrier;