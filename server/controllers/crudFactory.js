// Builds list / get / create / update / remove handlers for any model
// that has an `owner` field. Every query is scoped to req.user, so a business
// user can never read or change another business user's data.
//
// Options:
//   fields       - body fields that may be written (anything else is ignored)
//   populate     - Mongoose populate option for returned documents
//   sort         - sort order for the list endpoint
//   validate     - async (req, data) => error message string, or null if OK
//   beforeCreate - async (req, data) => extra fields to save (e.g. { number })
//   afterSave    - async (item, req) => runs after a create or update
//   canUpdate    - async (item) => message if editing is not allowed, else null
//   canDelete    - async (item) => message if deleting is not allowed, else null
//   onDelete     - async (item) => cleanup after a delete (e.g. remove children)

const pick = (body, fields) =>
  fields.reduce((acc, f) => {
    // empty string -> undefined, so empty optional fields are cleared
    if (body[f] !== undefined) acc[f] = body[f] === "" ? undefined : body[f];
    return acc;
  }, {});

const handleError = (res, err) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid value for ${err.path}` });
  }
  return res.status(500).json({ message: err.message });
};

function crudFactory(
  Model,
  {
    fields,
    populate,
    sort = { createdAt: -1 },
    validate,
    beforeCreate,
    afterSave,
    canUpdate,
    canDelete,
    onDelete,
  },
) {
  const owned = (req) => ({ _id: req.params.id, owner: req.user._id });

  return {
    // GET /
    list: async (req, res) => {
      try {
        const query = Model.find({ owner: req.user._id }).sort(sort);
        if (populate) query.populate(populate);
        res.json({ items: await query });
      } catch (err) {
        handleError(res, err);
      }
    },

    // GET /:id
    get: async (req, res) => {
      try {
        const query = Model.findOne(owned(req));
        if (populate) query.populate(populate);
        const item = await query;
        if (!item) return res.status(404).json({ message: "Not found" });
        res.json({ item });
      } catch (err) {
        handleError(res, err);
      }
    },

    // POST /
    create: async (req, res) => {
      try {
        const data = pick(req.body, fields);
        const problem = validate && (await validate(req, data));
        if (problem) return res.status(400).json({ message: problem });

        const extra = beforeCreate ? await beforeCreate(req, data) : {};
        const item = await Model.create({
          ...data,
          ...extra,
          owner: req.user._id,
        });
        if (afterSave) await afterSave(item, req);
        if (populate) await item.populate(populate);
        res.status(201).json({ item });
      } catch (err) {
        handleError(res, err);
      }
    },

    // PUT /:id
    update: async (req, res) => {
      try {
        const item = await Model.findOne(owned(req));
        if (!item) return res.status(404).json({ message: "Not found" });

        const blocked = canUpdate && (await canUpdate(item));
        if (blocked) return res.status(409).json({ message: blocked });

        const data = pick(req.body, fields);
        const problem = validate && (await validate(req, data));
        if (problem) return res.status(400).json({ message: problem });

        item.set(data);
        await item.save();
        if (afterSave) await afterSave(item, req);
        if (populate) await item.populate(populate);
        res.json({ item });
      } catch (err) {
        handleError(res, err);
      }
    },

    // DELETE /:id
    remove: async (req, res) => {
      try {
        const item = await Model.findOne(owned(req));
        if (!item) return res.status(404).json({ message: "Not found" });

        const blocked = canDelete && (await canDelete(item));
        if (blocked) return res.status(409).json({ message: blocked });

        await item.deleteOne();
        if (onDelete) await onDelete(item);
        res.json({ message: "Deleted" });
      } catch (err) {
        handleError(res, err);
      }
    },
  };
}

module.exports = crudFactory;
module.exports.handleError = handleError;
