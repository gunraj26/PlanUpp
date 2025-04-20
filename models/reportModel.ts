import { supabase } from "@/lib/supabase-client"

/**
 * Load all user reports for admin review
 * @returns {Promise<Array>} - Array of user reports with user details
 */
export async function loadBanUserRequests() {
  try {
    // Fetch all reports
    const { data, error } = await supabase
      .from("User_reports")
      .select("*")
      .order("dateReported", { ascending: false })
      .order("timeReported", { ascending: false })

    if (error) throw error

    // Now fetch user details for each report
    const reportsWithUsers = await Promise.all(
      data.map(async (report) => {
        // Get reported user
        const { data: reportedUser } = await supabase
          .from("Users")
          .select("id, name, profilePic, bans")
          .eq("id", report.profileReportedId)
          .single()
          .catch(() => ({ data: null }))

        // Get reporting user
        const { data: reportingUser } = await supabase
          .from("Users")
          .select("id, name, profilePic")
          .eq("id", report.reportingProfileId)
          .single()
          .catch(() => ({ data: null }))

        return {
          ...report,
          reported_user: reportedUser,
          reporting_user: reportingUser,
        }
      }),
    )

    return reportsWithUsers
  } catch (err) {
    console.error("Failed to load ban requests:", err)
    throw err
  }
}

/**
 * Ban a user and update the report status
 * @param {string} userId - The user ID to ban
 * @param {string} reportId - The report ID associated with the ban
 * @returns {Promise<Object>} - The updated user and report
 */
export async function banUserAndUpdateReport(userId, reportId) {
  try {
    console.log("Starting ban process for user:", userId, "Report ID:", reportId)

    // STEP 1: Get current user data to check current ban count
    console.log("Fetching current user data")
    const { data: userData, error: userError } = await supabase.from("Users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      throw userError
    }

    console.log("Current user data:", userData)
    const currentBans = userData.bans || 0
    const newBanCount = currentBans + 1

    console.log(`Will update ban count from ${currentBans} to ${newBanCount}`)

    // STEP 2: Update the user's ban count
    console.log("Updating user ban count")
    const { data: updateResult, error: updateError } = await supabase
      .from("Users")
      .update({ bans: newBanCount })
      .eq("id", userId)
      .select()

    if (updateError) {
      console.error("Error updating user ban count:", updateError)
      throw updateError
    }

    console.log("Ban count update result:", updateResult)

    // STEP 3: Verify the update was successful
    console.log("Verifying ban count update")
    const { data: verifyData, error: verifyError } = await supabase
      .from("Users")
      .select("bans")
      .eq("id", userId)
      .single()

    if (verifyError) {
      console.error("Error verifying ban count update:", verifyError)
    } else {
      console.log("Verified ban count after update:", verifyData)

      if (verifyData.bans !== newBanCount) {
        console.error(`Ban count verification failed! Expected ${newBanCount}, got ${verifyData.bans}`)
      } else {
        console.log("Ban count verification successful!")
      }
    }

    // STEP 4: Update the report status
    console.log("Updating report status to BANNED")
    const { data: reportUpdate, error: reportError } = await supabase
      .from("User_reports")
      .update({ status: "BANNED" })
      .eq("reportId", reportId)
      .select()

    if (reportError) {
      console.error("Error updating report status:", reportError)
      throw reportError
    }

    console.log("Report status updated:", reportUpdate)

    return {
      user: verifyData || updateResult?.[0] || { id: userId, bans: newBanCount },
      report: reportUpdate?.[0],
      isPermanentlyBanned: newBanCount >= 5,
      banCount: newBanCount,
    }
  } catch (err) {
    console.error("Failed to ban user:", err)
    throw err
  }
}

/**
 * Ignore a user report (mark as reviewed but take no action)
 * @param {string} reportId - The report ID to ignore
 * @returns {Promise<Object>} - The updated report
 */
export async function ignoreReport(reportId) {
  try {
    const { data, error } = await supabase
      .from("User_reports")
      .update({ status: "IGNORED" })
      .eq("reportId", reportId)
      .select()

    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Failed to ignore report:", err)
    throw err
  }
}

/**
 * Create a new user report
 * @param {Object} reportData - The report data
 * @param {string} userId - The reporting user's ID
 * @returns {Promise<Object>} - The created report
 */
export async function createUserReport(reportData, userId) {
  try {
    if (!userId) throw new Error("User not authenticated")

    // Ensure the reporting user is the current user
    const newReport = {
      ...reportData,
      reportingProfileId: userId,
      status: "PENDING",
      dateReported: new Date().toISOString().split("T")[0],
      timeReported: new Date().toTimeString().split(" ")[0],
    }

    const { data, error } = await supabase.from("User_reports").insert([newReport]).select()

    if (error) throw error
    return data[0]
  } catch (err) {
    console.error("Failed to create report:", err)
    throw err
  }
}

