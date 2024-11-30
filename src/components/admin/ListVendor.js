import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import { useHistory } from 'react-router-dom';
import withAdminCheck from "./withAdminCheck";

const ListVendor = () => {
  const [vendors, setVendors] = useState([]); // To store vendor data
  const [selectedVendor, setSelectedVendor] = useState(null); // To store selected vendor for view/edit
  const [isEditing, setIsEditing] = useState(false); // To toggle between view/edit modes
  const history = useHistory();
  const userEmail = localStorage.getItem('username');
  const [input, setInput] = useState({
    email: userEmail,
  });

  const formRef = useRef(null);

  // Fetch vendors when component mounts
  useEffect(() => {
    const fetchUserRole = async () => {
      const username = localStorage.getItem('username'); // Get the username from local storage
      if (!username) {
        history.push("/"); // Redirect if username is not found in local storage
        return;
      }

      try {
        // Make the API call with the username in the request body
        const response = await axios.post(`${process.env.REACT_APP_HOST}/users/checkrole`, input);
        if (response.data.message !== 'admin') {
          history.push("/"); // Redirect if not admin
        } 
      } catch (error) {
        console.error('Error fetching user role:', error);
        history.push("/"); // Redirect if error occurs
      } 
    };

    fetchUserRole();

    // Fetch vendor list
    axios
      .get(`${process.env.REACT_APP_HOST}/vendor/`)
      .then((response) => setVendors(response.data))
      .catch((error) => console.error("Error fetching vendors:", error));
  }, []); // Empty dependency array to run on mount only

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // Handle View action
  const handleView = (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    setSelectedVendor(vendor);
    setIsEditing(false); // Set to view mode
    scrollToForm();
  };

  // Handle Edit action
  const handleEdit = (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    setSelectedVendor(vendor);
    setIsEditing(true); // Set to edit mode
    scrollToForm();
  };

  // Handle form submit for editing
  const handleSubmitEdit = (e) => {
    e.preventDefault();

    // Send POST request to update vendor
    axios
      .post(`${process.env.REACT_APP_HOST}/vendor/edit/${selectedVendor._id}`, selectedVendor)
      .then((response) => {
        console.log("Vendor updated successfully:", response.data);

        // After successful update, re-fetch the vendor list
        axios
          .get(`${process.env.REACT_APP_HOST}/vendor/`)
          .then((response) => {
            setVendors(response.data); // Update the vendor list with the latest data
            setIsEditing(false); // Set to view mode after editing
            setSelectedVendor(null); // Clear selected vendor after saving
          })
          .catch((error) => console.error("Error fetching updated vendors:", error));
      })
      .catch((error) => {
        console.error("Error updating vendor:", error);
        alert('There was an error updating the vendor.');
      });
  };

  return (
    <div className="container shadow">
      <h2 className="text-center my-3">List of Vendors</h2>
      <div className="col-md-12 my-3 d-flex items-center justify-content-center">
        <div className="row">
          {/* Vendor List Table */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.description}</td>
                  <td>
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={() => handleView(vendor._id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => handleEdit(vendor._id)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Vendor Details or Edit Form Below the Table */}
          <div ref={formRef}>
          {selectedVendor && (
            <div className="my-3">
              {isEditing ? (
                <div>
                  <h3>Edit Vendor</h3>
                  <Form onSubmit={handleSubmitEdit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="name">
                          <Form.Label>Vendor Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={selectedVendor.name}
                            onChange={(e) =>
                              setSelectedVendor({
                                ...selectedVendor,
                                name: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group controlId="description">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={selectedVendor.description}
                            onChange={(e) =>
                              setSelectedVendor({
                                ...selectedVendor,
                                description: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group controlId="is_active">
                          <Form.Check
                            type="checkbox"
                            label="Active"
                            checked={selectedVendor.is_active}
                            onChange={(e) =>
                              setSelectedVendor({
                                ...selectedVendor,
                                is_active: e.target.checked,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary" className="my-3">
                      Save Changes
                    </Button>
                  </Form>
                </div>
              ) : (
                <div>
                  <h3>Vendor Details</h3>
                  <p><strong>Vendor Name:</strong> {selectedVendor.name}</p>
                  <p><strong>Description:</strong> {selectedVendor.description}</p>
                  <p><strong>Status:</strong> {selectedVendor.is_active ? "Active" : "Inactive"}</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminCheck(ListVendor);
