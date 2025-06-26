const DSAInteraction = require('../models/dsaInteractionModel');

exports.getAllInteractions = async (req, res, next) => {
  try {
    const interactions = await DSAInteraction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    next(error);
  }
};

exports.getInteractionByFeatureType = async (req, res, next) => {
  try {
    const { featureType } = req.query;
    const interactions = await DSAInteraction.find({ userId: req.user.id, featureType: featureType }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions
    }
    );
  }catch (error) {
    next(error);
  }
}

exports.getInteractionById = async (req, res, next) => {
  try {
    const interaction = await DSAInteraction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found.',
      });
    }

    res.status(200).json({ success: true, data: interaction });
  } catch (error) {
    next(error);
  }
};


exports.deleteInteractionById = async (req, res, next) => {
  try {
    const deleted = await DSAInteraction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};


exports.clearAllInteractions = async (req, res, next) => {
  try {
    await DSAInteraction.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'All interactions cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};
