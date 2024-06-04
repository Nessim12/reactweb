import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Conge.css';

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState(new Date());
  const [holidayName, setHolidayName] = useState('');
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHolidayId, setEditHolidayId] = useState(null);
  const [editHolidayDate, setEditHolidayDate] = useState(new Date());
  const [editHolidayName, setEditHolidayName] = useState('');
  const [showHolidayTable, setShowHolidayTable] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/holidays`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setHolidays(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des jours fériés :', error);
      setError('Échec de la récupération des jours fériés. Veuillez réessayer.');
    }
  };

  const handleAddHoliday = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(`${API_BASE_URL}/api/admin/addholiday`, {
        holiday_date: holidayDate.toISOString().split('T')[0], // Formater la date en AAAA-MM-JJ
        holiday_name: holidayName
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setHolidays([...holidays, response.data.holiday]);
      setHolidayDate(new Date());
      setHolidayName('');
      setShowAddModal(false);
      Swal.fire('Ajouté !', 'Le jour férié a été ajouté avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du jour férié :', error);
      setError('Échec de l\'ajout du jour férié. Veuillez réessayer.');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr(e) ?',
        text: 'Vous ne pourrez pas récupérer cette vacance !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimez-la !',
        cancelButtonText: 'Non, annuler',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });

      if (result.isConfirmed) {
        const authToken = localStorage.getItem('authToken');
        await axios.delete(`${API_BASE_URL}/api/admin/deleteholiday/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const updatedHolidays = holidays.filter((holiday) => holiday.id !== id);
        setHolidays(updatedHolidays);
        Swal.fire('Supprimé !', 'Le jour férié a été supprimé.', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du jour férié :', error);
      setError('Échec de la suppression du jour férié. Veuillez réessayer.');
    }
  };

  const handleEditHoliday = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.put(`${API_BASE_URL}/api/admin/updateholiday/${editHolidayId}`, {
        holiday_date: editHolidayDate.toISOString().split('T')[0], // Formater la date en AAAA-MM-JJ
        holiday_name: editHolidayName
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const updatedHolidays = holidays.map((holiday) =>
        holiday.id === editHolidayId ? { ...holiday, holiday_date: editHolidayDate, holiday_name: editHolidayName } : holiday
      );
      setHolidays(updatedHolidays);
      setEditHolidayId(null);
      setEditHolidayDate(new Date());
      setEditHolidayName('');
      Swal.fire('Modifié !', 'Le jour férié a été modifié avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de la modification du jour férié :', error);
      setError('Échec de la modification du jour férié. Veuillez réessayer.');
    }
  };

  const openEditModal = (id, holidayDate, holidayName) => {
    setEditHolidayId(id);
    setEditHolidayDate(new Date(holidayDate));
    setEditHolidayName(holidayName);
  };

  const closeEditModal = () => {
    setEditHolidayId(null);
    setEditHolidayDate(new Date());
    setEditHolidayName('');
  };

  return (
    <div>
      <h2>Jours fériés</h2>
      {error && <p>{error}</p>}

      <Button variant="primary" onClick={() => setShowAddModal(true)}>Ajouter</Button>
      <Button variant="info" style={{ marginLeft: '10px' }} onClick={() => setShowHolidayTable(true)}>Gérer Jours fériés</Button>

      <Modal show={showHolidayTable} onHide={() => setShowHolidayTable(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Listes des Jours fériés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '400px',maxwidth:'400px' }}>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th style={{ width: '30%' }}>Nom</th>
                  <th  style={{ width: '60%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday, index) => (
                  <tr key={holiday.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 'bold',width:'100px' }}>{new Date(holiday.holiday_date).toLocaleDateString()}</td>
                    <td>{holiday.holiday_name}</td>
                    <td>
                      <Button style={{ marginRight: '5px', backgroundColor: '#4696C4' }} onClick={() => openEditModal(holiday.id, holiday.holiday_date, holiday.holiday_name)}>Modifier</Button>
                      <Button style={{ backgroundColor: '#D51515' }} onClick={() => handleDeleteHoliday(holiday.id)}>Supprimer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHolidayTable(false)}>Fermer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Jour férié</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <DatePicker selected={holidayDate} onChange={(date) => setHolidayDate(date)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              value={holidayName}
              onChange={(e) => setHolidayName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Fermer</Button>
          <Button variant="primary" onClick={handleAddHoliday}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editHolidayId} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Jour férié</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <DatePicker selected={editHolidayDate} onChange={(date) => setEditHolidayDate(date)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              value={editHolidayName}
              onChange={(e) => setEditHolidayName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>Fermer</Button>
          <Button variant="primary" onClick={handleEditHoliday}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Holiday;
