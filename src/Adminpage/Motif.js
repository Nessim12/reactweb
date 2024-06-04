import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import './Conge.css';

const Motif = () => {
  const [motifs, setMotifs] = useState([]);
  const [newMotifName, setNewMotifName] = useState('');
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMotifId, setEditMotifId] = useState(null);
  const [editMotifName, setEditMotifName] = useState('');
  const [showMotifTable, setShowMotifTable] = useState(false);

  useEffect(() => {
    fetchMotifs();
  }, []);

  const fetchMotifs = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/allmotifs`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setMotifs(response.data.motifs);
    } catch (error) {
      console.error('Erreur lors de la récupération des motifs:', error);
      setError('Échec de la récupération des motifs. Veuillez réessayer.');
    }
  };
  
  const handleAddMotif = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(`${API_BASE_URL}/api/admin/addmotif`, {
        motif_name: newMotifName
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setMotifs([...motifs, response.data.motif]);
      setNewMotifName('');
      setShowAddModal(false);
      Swal.fire('Succès', 'Motif ajouté avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du motif:', error);
      Swal.fire('Erreur', 'Échec de l\'ajout du motif. Veuillez réessayer.', 'error');
    }
  };
  
  const handleDeleteMotif = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr(e) ?',
        text: 'Vous ne pourrez pas récupérer ce motif !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimez-le !',
        cancelButtonText: 'Non, annuler',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });
  
      if (result.isConfirmed) {
        const authToken = localStorage.getItem('authToken');
        await axios.delete(`${API_BASE_URL}/api/admin/deletemotif/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const updatedMotifs = motifs.filter((motif) => motif.id !== id);
        setMotifs(updatedMotifs);
        Swal.fire('Supprimé !', 'Le motif a été supprimé.', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du motif:', error);
      Swal.fire('Erreur', 'Échec de la suppression du motif. Veuillez réessayer.', 'error');
    }
  };

  const handleEditMotif = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      await axios.put(`${API_BASE_URL}/api/admin/updatemotif/${editMotifId}`, {
        motif_name: editMotifName
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const updatedMotifs = motifs.map((motif) =>
        motif.id === editMotifId ? { ...motif, motif_name: editMotifName } : motif
      );
      setMotifs(updatedMotifs);
      setEditMotifId(null);
      setEditMotifName('');
      Swal.fire('Succès', 'Motif mis à jour avec succès.', 'success');
    } catch (error) {
      console.error('Erreur lors de la modification du motif:', error);
      Swal.fire('Erreur', 'Échec de la modification du motif. Veuillez réessayer.', 'error');
    }
  };
  

  const openEditModal = (id, motifName) => {
    setEditMotifId(id);
    setEditMotifName(motifName);
  };

  const closeEditModal = () => {
    setEditMotifId(null);
    setEditMotifName('');
  };

  return (
    <div>
      <h2>Motifs</h2>
      {error && <p>{error}</p>}

      <Button variant="primary" onClick={() => setShowAddModal(true)}>Ajouter</Button>
      <Button variant="info" style={{ marginLeft: '10px' }} onClick={() => setShowMotifTable(true)}>Gérer motifs</Button>

      <Modal show={showMotifTable} onHide={() => setShowMotifTable(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Liste des motifs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {motifs.map((motif, index) => (
                  <tr key={motif.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: 'bold' }}>{motif.motif_name}</td>
                    <td>
                      <Button style={{ marginRight: '5px', backgroundColor: '#4696C4' }} onClick={() => openEditModal(motif.id, motif.motif_name)}>Modifier</Button>
                      <Button style={{ backgroundColor: '#D51515' }} onClick={() => handleDeleteMotif(motif.id)}>Supprimer</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMotifTable(false)}>Fermer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter Motif</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motif</Form.Label>
            <Form.Control
              type="text"
              value={newMotifName}
              onChange={(e) => setNewMotifName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Fermer</Button>
          <Button variant="primary" onClick={handleAddMotif}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editMotifId} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier Motif</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Motif</Form.Label>
            <Form.Control
              type="text"
              value={editMotifName}
              onChange={(e) => setEditMotifName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>Fermer</Button>
          <Button variant="primary" onClick={handleEditMotif}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Motif;
