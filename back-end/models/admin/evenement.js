class Event {
    constructor({ id_event, event, date, created_by }) {
      this.id_event = id_event;
      this.event = event;
      this.date = date;
      this.created_by = created_by;
    }
  
    validate() {
      if (!this.event || !this.date || !this.created_by) {
        throw new Error('Tous les champs (title, date, created_by) sont requis');
      }
    }
  }
  
  module.exports = Event;