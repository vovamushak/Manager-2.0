import Log from "../models/Log.model.js";
import Worker from "../models/User.model.js";
import ResponseError from '../utils/ResponseError.js';
import ReqQueryHelper from "../utils/ReqQueryHelper.js";
import * as queryHelper from "../utils/queryHelper.js";
import { Types } from 'mongoose';
const { ObjectId } = Types;

// @desc    Get all logs
export const getLogs = async (req, res, next) => {
    const { startDate, endDate, search } = ReqQueryHelper(req.query);
    const filter = queryHelper.logsQuery(search, startDate, endDate);

    //  Filter logs by requested user if the user is Level 1
    if (req.user.accessLevel === "User") {
        filter.unshift({ $match: { worker: ObjectId(req.user.id) } });
    }

    try {
        const logs = await Log
            .aggregate(filter)
            .sort({ date: -1 });

        const _id = logs.map(({ _id }) => _id);

        //  Find the sum of payments
        let paymentSums = await Log.aggregate(queryHelper.logsPaymentsSum(_id));
        if (paymentSums.length < 1)
            paymentSums = [{ paymentsSum: 0 }];

        //  Find the days count and OTV sum
        let attendanceSums = await Log.aggregate(queryHelper.logsAttendanceSums(_id));
        if (attendanceSums.length < 1) {
            attendanceSums = [{ daysCount: 0 }];
            attendanceSums = [{ OTVSum: 0 }];
        }

        return res.status(200).json({
            success: true,
            data: {
                logs,
                paymentsSum: paymentSums[0].paymentsSum,
                daysCount: attendanceSums[0].daysCount,
                OTVSum: attendanceSums[0].OTVSum,
                startDate,
                endDate,
                search,
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a log
export const createLog = async (req, res, next) => {
    const { date, isAbsent, startingTime, finishingTime, payment, extraNotes } = req.body;

    if (!date || !req.body.worker)
        return next(new ResponseError("Please provide a date and workerId", 400));

    if ((isAbsent === undefined || isAbsent === null) && (!startingTime || !finishingTime)) {
        return next(new ResponseError("Please provide a starting time and finishing time", 400));
    }

    try {
        const worker = await Worker.findById(req.body.worker);
        if (!worker)
            return next(new ResponseError("Worker not found", 404));

        const log = new Log({
            worker: req.body.worker, date, isAbsent, startingTime, finishingTime, payment, extraNotes
        });
        await log.save();

        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a log
export const getLog = async (req, res, next) => {
    try {
        const log = await Log.aggregate(queryHelper.logQuery(req.params.logID));
        if (!log || log.length === 0)
            return next(new ResponseError("Log not found", 404));

        return res.status(200).json({
            success: true,
            data: log
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Update a log
export const updateLog = async (req, res, next) => {
    const { isAbsent, startingTime, finishingTime } = req.body;

    if ((isAbsent === undefined || isAbsent === null) && (!startingTime || !finishingTime)) {
        return next(new ResponseError("Please provide a starting time and finishing time", 400));
    }

    try {
        const log = await Log.findByIdAndUpdate(req.params.logID, req.body, {
            new: true,
            runValidators: true
        });
        if (!log)
            return next(new ResponseError("Log not found", 404));

        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a log
export const deleteLog = async (req, res, next) => {
    try {
        const log = await Log.findById(req.params.logID);
        if (!log)
            return next(new ResponseError("Log not found", 404));

        await Log.findByIdAndDelete(req.params.logID);

        return res.sendStatus(204);
    } catch (error) {
        next(error);
    }
};