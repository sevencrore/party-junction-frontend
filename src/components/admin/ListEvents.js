import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import withAdminCheck from "./withAdminCheck";

const ListEvent = () => {
  const userEmail = localStorage.getItem("username"); // User email stored in local storage
  const [events, setEvents] = useState([]); // To store events data
  const [vendors, setVendors] = useState([]); // To store vendor data
  const [categories, setCategories] = useState([]); // To store category data
  const [title, setTitle] = useState([]);
  const [host_name, setHost_name] = useState([]); 
  const [location_description, setLocation_description] = useState([]);
  const [cities, setCities] = useState([]); // To store city data
  const [selectedEvent, setSelectedEvent] = useState(null); // To store selected event for view/edit
  const [isEditing, setIsEditing] = useState(false); // To toggle between view/edit modes
  const [isAddingDetails, setIsAddingDetails] = useState(false); // To toggle between adding event details or not
  const [eventDetails, setEventDetails] = useState({
    email: userEmail,
    date: "",
    price: "",
    slots: "",
    language: "",
    time: "",
    event_id: "", // The event ID will be set when an event is selected
  });
  const [img, setimg] = useState(null); // To store selected image
  const [img1, setimg1] = useState(null); // To store selected image
  const [img2, setimg2] = useState(null); // To store selected image
  const [img3, setimg3] = useState(null); // To store selected image
  const [bg_img, setbg_img] = useState(null); // To store selected image
  const [full, setfull] = useState(null); // To store selected image

  const handleFullChange = (e) => {
    const value = e.target.value; // Get the input value
    console.log("Input value:", value); // Debug the raw input value
    setfull(value !== "" ? Number(value) : null); // Set as number or null
  };
  
  

  const formRef = useRef(null);

  // Fetch events, vendors, categories, and cities when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch events
    axios
      .get(`${process.env.REACT_APP_HOST}/event/`)
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));

    // Fetch vendors
    axios
      .get(`${process.env.REACT_APP_HOST}/vendor/`)
      .then((response) => setVendors(response.data))
      .catch((error) => console.error("Error fetching vendors:", error));

    // Fetch categories
    axios
      .get(`${process.env.REACT_APP_HOST}/eventCategory/`)
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));

    // Fetch cities
    axios
      .get(`${process.env.REACT_APP_HOST}/city/`)
      .then((response) => setCities(response.data))
      .catch((error) => console.error("Error fetching cities:", error));
  }, []);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle View action
  const handleView = (eventId) => {
    const event = events.find((e) => e._id === eventId);
    setSelectedEvent(event);
    setIsEditing(false); // Set to view mode
    setIsAddingDetails(false); // Hide "Add Event Details" form
    scrollToForm();
  };

  // Handle Edit action
  const handleEdit = (eventId) => {
    const event = events.find((e) => e._id === eventId);
    setSelectedEvent(event);
    setIsEditing(true); // Set to edit mode
    setIsAddingDetails(false); // Hide "Add Event Details" form
    scrollToForm();
  };

  // Handle Add Event Details action
  const handleAddEventDetails = (eventId) => {
    const event = events.find((e) => e._id === eventId);
    if (event) {
      setEventDetails({
        email: userEmail,
        date: "",
        price: "",
        slots: "",
        language: "",
        time: "",
        event_id: eventId, // Set the event_id to the selected event
      });
    }
    setSelectedEvent(event);
    setIsAddingDetails(true); // Show the form to add event details
    setIsEditing(false); // Hide edit mode
    scrollToForm();
  };


  const handleSubmitEditDetails = (e) => {
    e.preventDefault();

    if (!selectedEvent || !selectedEvent._id) {
      alert("No event selected for editing.");
      return;
    }
    debugger;
    // Send updated event data to the API
    const formData = new FormData();
    formData.append("title", selectedEvent.title);
    formData.append("host_name", selectedEvent.host_name);
    formData.append("location_description", selectedEvent.location_description);
    formData.append("vendor_id", selectedEvent.vendor_id);
    formData.append("category_id", selectedEvent.category_id);
    formData.append("city_id", selectedEvent.city_id);
    formData.append("img", img);
    formData.append("img1", img1);
    formData.append("img2", img2);
    formData.append("img3", img3);
    formData.append("bg_img", bg_img);
    formData.append("full", selectedEvent.full);
    formData.append("area", selectedEvent.area);
    formData.append("date", selectedEvent.date);
    

    axios
      .post(`${process.env.REACT_APP_HOST}/event/edit/${selectedEvent._id}`, formData)
      .then((response) => {
        console.log("Event updated:", response.data);
        // Update the events list with the edited event
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === selectedEvent._id ? response.data : event
          )
        );

        alert("Event updated successfully!");
        setIsEditing(false); // Exit editing mode
        setSelectedEvent(null); // Reset selected event
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating event:", error);
        alert("Failed to update event. Please try again.");
      });
  };


  // Handle form submit for adding event details
  const handleSubmitEventDetails = (e) => {
    e.preventDefault();
    debugger;
    // Check if event_id is set
    if (!eventDetails.event_id) {
      alert("Please select a valid event.");
      return;
    }

    // Send a POST request to save the event details
    axios
      .post(`${process.env.REACT_APP_HOST}/eventDetails/create`, eventDetails)
      .then((response) => {
        console.log("Event details created:", response.data);

        // Reset the form after successful submission
        setEventDetails({
          email: userEmail, // Assuming the userEmail is still available
          date: "",
          price: "",
          slots: "",
          language: "",
          time: "",
          event_id: "", // Reset the event_id
        });

        // Display success message
        alert("Event Details Saved Successfully!");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error saving event details:", error);
        alert("Error saving event details. Please try again.");
      });
  };

  return (
    <div className="container shadow">
      <h2 className="text-center my-3">List of Events</h2>
      <div className="col-md-12 my-3 d-flex items-center justify-content-center">
        <div className="row">
          {/* Event List Table */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Host Name</th>
                <th>Location</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>
                    {/* Display category name */}
                    {categories.find(
                      (category) => category._id === event.category_id
                    )?.category_name || "N/A"}
                  </td>
                  <td>
                    {/* Display vendor name */}
                    {vendors.find((vendor) => vendor._id === event.vendor_id)
                      ?.name || "N/A"}
                  </td>
                  <td>{event.host_name}</td>
                  <td>{event.location_description}</td>
                  <td>
                    {/* Display city name */}
                    {cities.find((city) => city._id === event.city_id)?.name ||
                      "N/A"}
                  </td>
                  <td>
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={() => handleView(event._id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEdit(event._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => handleAddEventDetails(event._id)}
                    >
                      Add Event Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div ref={formRef}>
            {/* Display Event Details / Edit Form Below the Table */}
            {selectedEvent && !isAddingDetails && (
              <div className="my-3">
                {isEditing ? (
                  <div>
                    <h3>Edit Event</h3>
                    <Form onSubmit={handleSubmitEditDetails}>
                      <Row>
                        <Col md={6}>
                          <Form.Group controlId="title">
                            <Form.Label>Event Title</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedEvent.title}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  title: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="host_name">
                            <Form.Label>Host Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedEvent.host_name}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  host_name: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group controlId="category">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedEvent.category_id}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  category_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                  {category.category_name}
                                </option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="vendor">
                            <Form.Label>Vendor</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedEvent.vendor_id}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  vendor_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Vendor</option>
                              {vendors.map((vendor) => (
                                <option key={vendor._id} value={vendor._id}>
                                  {vendor.name}
                                </option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              as="select"
                              value={selectedEvent.city_id}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  city_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Select City</option>
                              {cities.map((city) => (
                                <option key={city._id} value={city._id}>
                                  {city.name}
                                </option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Col md={6}>
                        <Form.Group controlId="full">
                          <Form.Label>Full percentage</Form.Label>
                          <Form.Control
                            type="number"
                            value={selectedEvent.full}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                full: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="img">
                          <Form.Label>Image 1</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              debugger;
                              const file = e.target.files[0];
                              setimg(file);
                              setSelectedEvent({
                                ...selectedEvent,
                                img: URL.createObjectURL(file),
                              });
                            }}
                          />
                        </Form.Group>
                      </Col>


                      <Col md={6}>
                        <Form.Group controlId="img1">
                          <Form.Label>Image 2</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              debugger;
                              const file = e.target.files[0];
                              setimg1(file);
                              setSelectedEvent({
                                ...selectedEvent,
                                img: URL.createObjectURL(file),
                              });
                            }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="img2">
                          <Form.Label>Image 3</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setimg2(file);
                              setSelectedEvent({
                                ...selectedEvent,
                                img: URL.createObjectURL(file),
                              });
                            }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="img3">
                          <Form.Label>Image 4</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setimg3(file);
                              setSelectedEvent({
                                ...selectedEvent,
                                img: URL.createObjectURL(file),
                              });
                            }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group controlId="bg_img">
                          <Form.Label>Background Image</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setbg_img(file);
                              setSelectedEvent({
                                ...selectedEvent,
                                img: URL.createObjectURL(file),
                              });
                            }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                          <Form.Group controlId="date">
                            <Form.Label>Event Date</Form.Label>
                            <Form.Control
                              type="date"
                              value={selectedEvent.date}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  date: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>
                    
                      <Col md={6}>
                          <Form.Group controlId="area">
                            <Form.Label>Area</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedEvent.area}
                              onChange={(e) =>
                                setSelectedEvent({
                                  ...selectedEvent,
                                  area: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>

                      <Form.Group controlId="location">
                        <Form.Label>Location Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={selectedEvent.location_description}
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              location_description: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                      <Button type="submit" variant="primary" className="my-3">
                        Save Changes
                      </Button>
                    </Form>
                  </div>
                ) : (
                  <div>
                    <h3>Event Details</h3>
                    <p>
                      <strong>Event Title:</strong> {selectedEvent.title}
                    </p>
                    <p>
                      <strong>Host Name:</strong> {selectedEvent.host_name}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {categories.find(
                        (category) => category._id === selectedEvent.category_id
                      )?.category_name || "N/A"}
                    </p>
                    <p>
                      <strong>Vendor:</strong>{" "}
                      {vendors.find(
                        (vendor) => vendor._id === selectedEvent.vendor_id
                      )?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Area:</strong>{" "}
                      {selectedEvent.area}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedEvent.location_description}
                    </p>
                    <p>
                      <strong>Full percentage :</strong>{" "}
                      {selectedEvent.full} %
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {selectedEvent.date}
                    </p>
                    <p>
                      <strong>City:</strong>{" "}
                      {cities.find((city) => city._id === selectedEvent.city_id)
                        ?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Location lat:</strong>{" "}
                      {selectedEvent.location_lat?.$numberDecimal || "N/A"}
                    </p>
                    <p>
                      <strong>Location lng:</strong>{" "}
                      {selectedEvent.location_lang?.$numberDecimal || "N/A"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add New Event Details Form (Only visible when "Add Event Details" is clicked) */}
          <div ref={formRef}>
            {isAddingDetails && (
              <div className="my-3">
                <h3>Add New Event Details</h3>
                <Form onSubmit={handleSubmitEventDetails}>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="event_id">
                        <Form.Label>Event</Form.Label>
                        <Form.Control
                          type="text"
                          value={
                            events.find((event) => event._id === eventDetails.event_id)?.title || ""
                          }
                          readOnly
                        />
                      </Form.Group>

                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="date">
                        <Form.Label>Event Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={eventDetails.date}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              date: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="price">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="number"
                          value={eventDetails.price}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              price: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="time">
                        <Form.Label>Time</Form.Label>
                        <Form.Control
                          type="text"
                          value={eventDetails.time}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              time: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="langauage">
                        <Form.Label>Language</Form.Label>
                        <Form.Control
                          type="text"
                          value={eventDetails.language}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              language: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="slots">
                        <Form.Label>Slots</Form.Label>
                        <Form.Control
                          type="string"
                          value={eventDetails.slots}
                          onChange={(e) =>
                            setEventDetails({
                              ...eventDetails,
                              slots: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button type="submit" variant="primary" className="my-3">
                    Save Event Details
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminCheck(ListEvent);