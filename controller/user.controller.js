

module.exports.postUser = async (request, h) => {
    try {
        var user = new userModel(request.payload);
        var result = await user.save();
        return h.response(result);
    } catch (error) {
        return h.response(error).code(500);
    }
}
