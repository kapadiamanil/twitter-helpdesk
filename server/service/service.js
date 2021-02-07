import { ErrorHandler } from "../middleware/error";
import { ERROR_MESSAGE } from "../ErrorMessages";

export const createEntity = async (entityObject, opts) => {
    let newEntity;
    try {
        newEntity = opts
            ? await entityObject.save(opts)
            : await entityObject.save();
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }

    return newEntity;
};

export const deleteEntity = async (entityObject, opts) => {
    let deletedEntity;
    try {
        deletedEntity = opts
            ? await entityObject.remove(opts)
            : await entityObject.remove();
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }

    if (deletedEntity) return deletedEntity;
    else throw new ErrorHandler(400, ERROR_MESSAGE.ENTITY_NOT_FOUND);
};

export const findOneEntity = async (id, EntityModelObject) => {
    let singleEntity;
    try {
        singleEntity = await EntityModelObject.findOne({ _id: id });
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }

    if (singleEntity) return singleEntity;
    else throw new ErrorHandler(400, ERROR_MESSAGE.ENTITY_NOT_FOUND);
};

export const findAllEntity = async (EntityModelObject) => {
    let allEntities;
    try {
        allEntities = await EntityModelObject.find({}).sort({ createdAt: -1 });
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }
    return allEntities;
};

export const saveAll = async (objectsToSave, opts) => {
    try {
        await Promise.all(
            objectsToSave.map(async (objectToSave) => {
                await createEntity(objectToSave, opts);
            })
        );
    } catch (e) {
        throw new ErrorHandler(400, ERROR_MESSAGE.SAVE_ALL_ERROR);
    }
};

export const findOneEntityCustom = async (customObject, EntityModelObject) => {
    try {
        const singleEntity = await EntityModelObject.findOne(customObject);
        return singleEntity;
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }
};

export const findOneLatestEntity = async (EntityModelObject) => {
    try {
        const singleEntity = await EntityModelObject.findOne().sort(
            "-createdAt"
        );
        return singleEntity;
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }
};

export const findAllEntityCustom = async (customObject, EntityModelObject) => {
    let allEntities;
    try {
        allEntities = await EntityModelObject.find(
            customObject,
            EntityModelObject
        ).sort({ createdAt: -1 });
    } catch (e) {
        throw new ErrorHandler(500, ERROR_MESSAGE.DATABASE_FAILURE, e);
    }
    return allEntities;
};
