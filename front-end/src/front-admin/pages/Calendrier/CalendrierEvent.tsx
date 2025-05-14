import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import frLocale from '@fullcalendar/core/locales/fr.js';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuthAdmin';
import Calendrier from '../../../front-user/vues/ProfilFormateur/Calendrier';
/*
const Calendrier: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  // Récupérer les événements au chargement du composant
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to fetch events from API
  const fetchEvents = () => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/api/calendrier`)
          .then(response => {
        const formattedEvents = response.data.map((event: any) => ({
          id: event.id_event,
      title: event.title || event.event, // Gère les deux noms possibles
          start: event.date,
          created_by: event.created_by,
          extendedProps: {
            created_by: event.created_by,
        id_event: event.id_event // Ajoutez explicitement id_event

          },
        }));
        setEvents(formattedEvents);
      })
      .catch(error => console.error('Erreur lors de la récupération des événements :', error));
  };

  // Gérer la création d'un nouvel événement
  const handleDateClick = (info: any) => {
    const title = prompt("Entrez le titre de l'événement :");
    
    if (title) {
      axios.post(`${import.meta.env.VITE_APP_API_URL}/api/calendrier`, 
                { title, date: info.dateStr, created_by: user.nom_admin }, 
{
        headers: { Authorization: `${localStorage.getItem('user')}` }
      })
      .then(response => {
        fetchEvents();
      })
      .catch(error => console.error('Erreur lors de la création de l\'événement :', error));
    }
  };

  // Gérer la suppression d'un événement
  const handleEventClick = (info: any) => {
    const token = localStorage.getItem('user');
  
    if (!token) {
      alert('Vous devez être connecté pour effectuer cette action.');
      return;
    }
  
    if (info.event.extendedProps.created_by === user.nom_admin) {
      if (window.confirm(`Voulez-vous supprimer l'événement : "${info.event.title}" ?`)) {
        axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/calendrier/${info.event.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        })
        .then(() => {
          fetchEvents();
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            alert('Accès refusé. Vous n\'avez pas les autorisations nécessaires pour supprimer cet événement.');
          } else {
            console.error('Erreur lors de la suppression de l\'événement :', error);
          }
        });
      }
    } else {
      alert('Vous ne pouvez supprimer que vos propres événements.');
    }
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <div>
        <b>{eventInfo.event.title}</b>
        <br />
        <i>Créateur: {eventInfo.event.extendedProps.created_by}</i>
      </div>
    );
  };
  
  return (
    <div className="App">
      <h1 className="text-2xl text-left text-gray-500 font-semibold mb-4">Marquez vos événements... </h1>
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

export default Calendrier;*/
<Calendrier/>