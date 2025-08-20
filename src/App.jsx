// src/App.jsx
import React, { useEffect, useReducer, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  message,
  Popconfirm,
  Space,
} from "antd";
import api from "./api";
import "antd/dist/reset.css";
import "./App.css";
const { Option } = Select;

const initialState = {
  loading: false,
  users: [],
  error: null,
  genderFilter: "all",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "setUsers":
      return { ...state, users: action.payload, loading: false };
    case "error":
      return { ...state, error: action.payload, loading: false };
    case "addUser":
      return { ...state, users: [action.payload, ...state.users] };
    case "updateUser":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };
    case "removeUser":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
      };
    case "setGenderFilter":
      return { ...state, genderFilter: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    dispatch({ type: "loading" });
    try {
      const params = { deleted: false };
      if (state.genderFilter && state.genderFilter !== "all")
        params.gender = state.genderFilter;
      const res = await api.get("/users", { params });

      const users = Array.isArray(res.data) ? res.data : res.data.data || [];
      dispatch({ type: "setUsers", payload: users });
    } catch (err) {
      dispatch({ type: "error", payload: err });
      message.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [state.genderFilter]);

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      gender: user.gender,
    });
    setModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // edit
        const res = await api.patch(`/users/${editingUser.id}`, values);
        const updatedUser = res.data;
        dispatch({ type: "updateUser", payload: updatedUser });
        message.success("User updated");
      } else {
        // add
        const res = await api.post("/users", values);
        const newUser = res.data;
        dispatch({ type: "addUser", payload: newUser });
        message.success("User added");
      }
      setModalVisible(false);
    } catch (err) {
      message.error("Save failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.patch(`/users/${id}`, { deleted: true });
      dispatch({ type: "removeUser", payload: id });
      message.success("User deleted");
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Edit</Button>
          <Popconfirm
            title="Confirm delete?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="app-container">
      <h2 className="app-title">User Management Dashboard</h2>

      <div className="app-controls">
        <Select
          value={state.genderFilter}
          onChange={(val) =>
            dispatch({ type: "setGenderFilter", payload: val })
          }
        >
          <Option value="all">All</Option>
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </Select>
        <Button type="primary" onClick={openAddModal}>
          Add User
        </Button>
      </div>

      {state.loading ? (
        <Spin tip="Loading...">
          <div style={{ height: 200 }} />
        </Spin>
      ) : (
        <div className="table-wrapper">
          <Table dataSource={state.users} columns={columns} rowKey="id" />
        </div>
      )}

      <Modal
        open={modalVisible}
        title={editingUser ? "Edit User" : "Add User"}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical" initialValues={{ gender: "male" }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
