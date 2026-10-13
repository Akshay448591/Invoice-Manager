const Client = require("../models/Client");
const User = require("../models/User");
const Project = require("../models/Project");
const Quote = require("../models/Quote");
const Invoice = require("../models/Invoice");

// GET /api/clients
exports.getClients = async (req, res) => {
  const clients = await Client.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ clients });
};

// GET /api/clients/:id
exports.getClient = async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json({ client });
};

// POST /api/clients
// Business user sets the client's email + password, which the client uses to log in.
exports.createClient = async (req, res) => {
  try {
    const { name, email, password, company, phone, address } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res
        .status(409)
        .json({ message: "This email already has an account" });
    }

    // TODO: wrap in a MongoDB transaction so both writes succeed or fail together
    const clientUser = await User.create({
      name,
      email,
      password,
      role: "client",
    });
    const client = await Client.create({
      owner: req.user._id,
      user: clientUser._id,
      name,
      email,
      company,
      phone,
      address,
    });
    res.status(201).json({ client });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/clients/:id
// Password is optional here: only changed when a new one is sent.
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!client) return res.status(404).json({ message: "Client not found" });

    const { name, email, password, company, phone, address } = req.body;

    const clientUser = await User.findById(client.user).select("+password");
    if (email && email.toLowerCase() !== client.email) {
      if (await User.findOne({ email: email.toLowerCase() })) {
        return res
          .status(409)
          .json({ message: "This email already has an account" });
      }
      clientUser.email = email;
      client.email = email;
    }
    if (name) {
      clientUser.name = name;
      client.name = name;
    }
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      clientUser.password = password; // hashed by the pre-save hook
    }
    client.company = company ?? client.company;
    client.phone = phone ?? client.phone;
    client.address = address ?? client.address;

    await clientUser.save();
    await client.save();
    res.json({ client });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!client) return res.status(404).json({ message: "Client not found" });

  // Projects, quotes and invoices point at this client, so remove them first
  const [hasProjects, hasQuotes, hasInvoices] = await Promise.all([
    Project.exists({ client: client._id }),
    Quote.exists({ client: client._id }),
    Invoice.exists({ client: client._id }),
  ]);
  if (hasProjects || hasQuotes || hasInvoices) {
    return res.status(409).json({
      message:
        "This client still has projects, quotes or invoices. Delete those first.",
    });
  }

  await client.deleteOne();
  await User.findByIdAndDelete(client.user); // client can no longer log in
  res.json({ message: "Client deleted" });
};
