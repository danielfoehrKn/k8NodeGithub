function detectEventType(req, res, next) {
    //not necessary but gives ability to join certain event types if needed & independent of business logic

    if (req.headers['x-github-event'] == 'push'){
        req.body.eventType = "push"
        console.log("Push event")
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
        req.body.eventType = "issueComment"
        console.log("IssueComent event")
    }
    else if (req.headers['x-github-event'] == 'issues') {
        req.body.eventType = "issue"
        console.log("Issue event")
    }

    else if (req.headers['x-github-event'] == 'create' || req.headers['x-github-event'] == 'delete'){
        req.body.eventType = "createDeleteBranch";
        console.log("createDelete")
    }
    else if (req.headers['x-github-event'] == 'commit_comment'){
        req.body.eventType = "commitComment";
        console.log("commit Comment")
    }

    else if (req.headers['x-github-event'] == 'pull_request_review'){
        req.body.eventType = "pullRequestReview";
        console.log("commit Comment")
    }

    else if (req.headers['x-github-event'] == 'pull_request_review_comment'){
        req.body.eventType = "pullRequestReviewComment";
        console.log("pull_request_review_comment")
    }

    next();
}

module.exports = detectEventType;
