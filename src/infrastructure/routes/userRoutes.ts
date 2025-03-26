import express from "express"
import { userController, userOtherController} from "../../interfaces/controllers/userController"
import { authenticateToken } from "../../interfaces/middlewares/authenticateToken";
import { authorizeRoles } from "../../interfaces/middlewares/authorizeRoles";


const router=express.Router()


router.post("/register",userController.register)
router.post("/verify-otp",userController.validateOtp)
router.post("/login",userController.login) 
router.post("/forgotpassword", userController.forgotPassword);
router.post("/change-forgotpassword", userController.changeForgottenPassword);
router.post("/verify-otp-forgotpassword", userController.verifyOtpForgotPassword);
router.post("/resend-otp",userController.resendOtp)
router.patch("/change-password",authenticateToken,authorizeRoles(["user"]),userController.changePassword)
router.post("/googleAuth",userController.googleAuth);

router.get("/getTurf",authenticateToken,authorizeRoles(["user"]),userController.getTurf)
router.get("/get-turf-details/:id",authenticateToken,authorizeRoles(["user"]),userController.getTurfDetails)
router.post("/add-location",authenticateToken,authorizeRoles(["user"]),userController.addLocation)
router.get("/location",authenticateToken,authorizeRoles(["user"]),userController.getLocation)
router.post("/give-ratings",authenticateToken,authorizeRoles(["user"]),userController.giveRatings)
router.get("/get-ratings/:id",authenticateToken,authorizeRoles(["user"]),userController.getRatings)
router.post("/report",authenticateToken,authorizeRoles(["user"]),userController.report)

router.get("/get-slots",authenticateToken,authorizeRoles(["user"]),userController.getSlots);
router.post("/confirm-booking",authenticateToken,authorizeRoles(["user"]),userController.confirmBooking)
router.get("/get-booking/:email",authenticateToken,authorizeRoles(["user"]),userController.getBookings)
router.patch("/cancel-booking",authenticateToken,authorizeRoles(["user"]),userController.cancelBooking)


router.post("/create-team",authenticateToken,authorizeRoles(["user"]),userController.createTeam)
router.get("/get-teams",authenticateToken,authorizeRoles(["user"]),userController.getTeams)
router.patch("/join-team",authenticateToken,authorizeRoles(["user"]),userController.joinTeam)
router.get("/get-team/:id",authenticateToken,authorizeRoles(["user"]),userController.getTeam)
router.get("/get-slot-sell/:email",authenticateToken,authorizeRoles(["user"]),userController.getSlotForSell)
router.patch("/left-remove-team",authenticateToken,authorizeRoles(["user"]),userController.leftRemoveTeam)
router.patch("/sell-slot",authenticateToken,authorizeRoles(["user"]),userController.sellSlot)
router.patch("/join-slot",authenticateToken,authorizeRoles(["user"]),userController.joinSlot)

// router.post("/chat",authenticateToken,authorizeRoles(["user"]),userOtherController.chat)
router.get("/get-messages",authenticateToken,authorizeRoles(["user"]),userOtherController.getMessages)



export default router