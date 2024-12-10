import { Router } from "express";
import client from "@repo/db/client"
import { CreateSpaceSchema } from "../../types";
import { userMiddleware } from "../../middleware/user";


export const spaceRouter = Router()

spaceRouter.post("/", userMiddleware ,async (req,res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }

    const [width, height] = parsedData.data.dimensions.split("x").map(Number);
    if (isNaN(width) || isNaN(height)) {
        res.status(400).json({ message: "Invalid dimensions format" });
        return;
    }

    if (!parsedData.data.mapId) {
        await client.space.create({
            data: {
                name: parsedData.data.name,
                width,
                height,
                creatorId: req.userId!
            }
        })
        res.json({message: "Space created"})
        return
    }
    const map = await client.map.findUnique({
        where: {
            id: parsedData.data.mapId
        }, select: {
            mapElements: true
        }
    })
    if (!map) {
        res.status(400).json({message: "Map not found"})
        return
    }

    await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width,
                height,
                creatorId: req.userId!,
            }
        })

        await client.spaceElements.createMany({
            data: map.mapElements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })
    })
})

spaceRouter.delete("/:spaceId", (req,res) => {
    
})

spaceRouter.get("/all", (req,res) => {
    
})

spaceRouter.post("/element", (req,res) => {
    
})

spaceRouter.delete("/element", (req,res) => {
    
})

spaceRouter.get("/:spaceId", (req,res)=> {
    
})