import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import withAdminCheck from "./withAdminCheck";

const ListCategory = () => {
  const [categories, setCategories] = useState([]); // To store category data
  const [selectedCategory, setSelectedCategory] = useState(null); // To store selected category for view/edit
  const [isEditing, setIsEditing] = useState(false); // To toggle between view/edit modes
  const [image, setImage] = useState(null); // To store selected image

  const formRef = useRef(null);

  // Fetch categories when component mounts
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_HOST}/eventCategory`)
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle View action
  const handleView = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    setSelectedCategory(category);
    setIsEditing(false); // Set view mode
    scrollToForm();
  };

  // Handle Edit action
  const handleEdit = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    setSelectedCategory(category);
    setIsEditing(true); // Set edit mode
    scrollToForm();
  };

  // Handle form submit for editing
  const handleSubmitEdit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_name", selectedCategory.category_name);
    formData.append("description", selectedCategory.description);
    if (image) formData.append("image", image);

    axios
      .post(
        `${process.env.REACT_APP_HOST}/eventCategory/edit/${selectedCategory._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then((response) => {
        console.log("Category updated successfully:", response.data);

        // Re-fetch the updated categories
        axios
          .get(`${process.env.REACT_APP_HOST}/eventCategory`)
          .then((response) => {
            setCategories(response.data); // Update the category list
            setIsEditing(false); // Set to view mode
            setSelectedCategory(null); // Clear selected category
            setImage(null); // Clear image input
          })
          .catch((error) =>
            console.error("Error fetching updated categories:", error)
          );
      })
      .catch((error) => console.error("Error updating category:", error));
  };

  return (
    <div className="container shadow">
      <h2 className="text-center my-3">List of Categories</h2>
      <div className="col-md-12 my-3 d-flex items-center justify-content-center">
        <div className="row">
          {/* Category List Table */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    {category.image ? (
                      <img
                        src={`${process.env.REACT_APP_HOST}${category.image}`}
                        alt={category.category_name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>
                  <td>{category.category_name}</td>
                  <td>{category.description}</td>
                  <td>
                    <Button
                      variant="info"
                      className="me-2"
                      onClick={() => handleView(category._id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => handleEdit(category._id)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Category Details or Edit Form Below the Table */}
          <div ref={formRef}>
            {selectedCategory && (
              <div className="my-3">
                {isEditing ? (
                  <div>
                    <h3>Edit Category</h3>
                    <Form onSubmit={handleSubmitEdit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group controlId="category_name">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={selectedCategory.category_name}
                              onChange={(e) =>
                                setSelectedCategory({
                                  ...selectedCategory,
                                  category_name: e.target.value,
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
                              value={selectedCategory.description}
                              onChange={(e) =>
                                setSelectedCategory({
                                  ...selectedCategory,
                                  description: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12}>
                          <Form.Group controlId="image">
                            <Form.Label>Category Image</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={(e) => setImage(e.target.files[0])}
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
                    <h3>Category Details</h3>
                    <p>
                      <strong>Category Name:</strong>{" "}
                      {selectedCategory.category_name}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedCategory.description}
                    </p>
                    {selectedCategory.image && (
                      <img
                        src={`${process.env.REACT_APP_HOST}${selectedCategory.image}`}
                        alt={selectedCategory.category_name}
                        style={{ width: "100px", height: "100px" }}
                      />
                    )}
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

export default withAdminCheck(ListCategory);
