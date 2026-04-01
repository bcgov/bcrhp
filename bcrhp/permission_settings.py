PERMISSION_FRAMEWORK = "bcrhp_default_deny.BcrhpDefaultDenyPermissionFramework"
# GROUP IDs
HERITAGE_BRANCH_GROUP_ID = 14
LOCAL_GOVERNMENT_GROUP_ID = 11
GUEST_GROUP_ID = 8

PERMISSION_DEFAULTS = {
    "cef9c510-e3e6-4057-ac08-89ad926180b4": [  # heritage_site
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
        {
            "id": LOCAL_GOVERNMENT_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "add_resourceinstance",
            ],
        },
        {
            "id": GUEST_GROUP_ID,
            "type": "group",
            "permissions": ["view_resourceinstance"],
        },
    ],
    "52dd40f2-1dee-45d2-b72c-234c8cbb5418": [  # legislative_act
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
        {
            "id": LOCAL_GOVERNMENT_GROUP_ID,
            "type": "group",
            "permissions": ["view_resourceinstance"],
        },
        {
            "id": GUEST_GROUP_ID,
            "type": "group",
            "permissions": ["view_resourceinstance"],
        },
    ],
    "aacf8bb6-3f6e-46d9-a551-b0749d7efffc": [  # local_government
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
        {
            "id": LOCAL_GOVERNMENT_GROUP_ID,
            "type": "group",
            "permissions": ["view_resourceinstance"],
        },
        {
            "id": GUEST_GROUP_ID,
            "type": "group",
            "permissions": ["view_resourceinstance"],
        },
        # {
        #     "id": ANONYMOUS_USER_ID,
        #     "type": "group",
        #     "permissions": ["view_resourceinstance"],
        # },
    ],
    "4e69d0a9-7af2-473f-929f-71d462ea32d1": [  # site_submission
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
    ],
    "c3923080-d21e-42d7-b8f1-637b9d0ab63c": [  # project_sandbox
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
    ],
    "f78a4bc3-c3ba-4079-9791-93eff58d6f19": [  # heritage_site_historical_data
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
    ],
    "412444dd-b13f-4289-9f04-5c7f1878ad4e": [  # lg_person
        {
            "id": HERITAGE_BRANCH_GROUP_ID,
            "type": "group",
            "permissions": [
                "view_resourceinstance",
                "change_resourceinstance",
                "delete_resourceinstance",
                "add_resourceinstance",
            ],
        },
    ],
}
