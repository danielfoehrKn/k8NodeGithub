function detectEventType(req, res, next) {
    //not necessary but gives ability to join certain event types if needed & independent of business logic

    if (req.headers['x-github-event'] == 'push'){
        if (req.body.commits.length != 0){
            req.body.eventType = "push"
            console.log("Push event")
        }
        else {
            console.log("Zero commits")
        }
    }
    else if (req.headers['x-github-event'] == 'pull_request') {
        req.body.eventType = "pull"
        console.log("Pull event")
    }
    else if (req.body.project_card) {
        req.body.eventType = "project_card"
        console.log("Project Card event")
    }
    else if (req.headers['x-github-event'] == 'issue_comment') {
        if (req.body.action == 'created' || req.body.action == 'deleted' ) {
            req.body.eventType = "issueComment"
        }
        else {req.body.eventType = "noSupport"}

        console.log("IssueComment event")
    }
    else if (req.headers['x-github-event'] == 'issues') {
        if (req.body.action == 'closed' || req.body.action == 'opened' || req.body.action == 'reopened' ) {
                req.body.eventType = "issue"
        }
        else {req.body.eventType = "noSupport"}
                console.log("Issue event")
    }

    else if (req.headers['x-github-event'] == 'create' || req.headers['x-github-event'] == 'delete'){
        req.body.eventType = "createDeleteBranch";
        console.log("createDelete")
    }
    else if (req.headers['x-github-event'] == 'commit_comment'){
        if (req.body.action == 'created' || req.body.action == 'deleted' ) {
        req.body.eventType = "commitComment";
        }
        else {req.body.eventType = "noSupport"}
        console.log("commit Comment")
    }

    else if (req.headers['x-github-event'] == 'pull_request_review'){
        req.body.eventType = "pullRequestReview";
        console.log("pull_request_review")
    }

    else if (req.headers['x-github-event'] == 'pull_request_review_comment'){
        if (req.body.action == 'created' || req.body.action == 'deleted' ) {
            req.body.eventType = "pullRequestReviewComment";
        }
        else {req.body.eventType = "noSupport"}
        console.log("pull_request_review_comment")
    }

    next();
}

module.exports = detectEventType;
