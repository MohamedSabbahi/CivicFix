const prisma = require('../utils/prisma');

const getReportComments = async (req, res) => {
    try{
        const { id } = req.params;
        const reportId = parseInt(id);

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            select: { id: true },
        });
        if (!report) {
            return res.status(404).json({
                status: "error",
                message: "Report not found" 
            });
        }
        const comments = await prisma.comment.findMany({
            where: { reportId },
            include: {
                user: {
                    select: {name: true}
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            status: "success",
            results: comments.length,
            data :comments
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch comments",
            details: error.message,
        });
    }
};

const createComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const reportId = parseInt(id);

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const commentCount = await prisma.comment.count({
            where: {
                userId: userId,
                createdAt: { gte: oneHourAgo }
            }
        });
        if (commentCount >= 5) {
            return res.status(429).json({
                status: "error",
                message: "You have reached the comment limit. Please try again later."
            });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Comment content cannot be empty"
            });
        }
        if (content.length > 500) {
            return res.status(400).json({
                status: "error",
                message: "Comment is too long. Maximum length is 500 characters"
            });
        }
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            select: { id: true },
        });
        if (!report) {
            return res.status(404).json({
                status: "error",
                message: "Report not found"
            });
        }
        const newComment = await prisma.comment.create({
            data: {
                text: content,
                reportId : parseInt(id),
                userId: userId
            },
            include: {
                user: { select: { name: true } }
            }
        });
        res.status(201).json({
            status: "success",
            data: newComment
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create comment",
            details: error.message,
        });
    }
};
const deleteComment = async (req, res) => {
    try {
        const { id , commentId} = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
        });

        if (!comment) {
            return res.status(404).json({
                status: "error",
                message: "Comment not found"
            });
        }

        if (comment.reportId !== parseInt(id)) {
            return res.status(400).json({
                status: "error",
                message: "This comment does not belong to this report"
            });
        }

        const isOwner = comment.userId === userId;
        const isAdmin = userRole === "ADMIN";

        if (isOwner || isAdmin) {
            await prisma.comment.delete({
                where: { id: parseInt(commentId) },
            });
            return res.status(200).json({
                status: "success",
                message: "Comment deleted successfully"
            });
        } else {
            return res.status(403).json({
                status: "error",
                message: "You do not have permission to delete this comment"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete comment",
            details: error.message,
        });
    }
};


module.exports = {
    getReportComments,
    createComment,
    deleteComment
};
