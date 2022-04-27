function schema() {
    return {
        preferences:            { type: 'object',   properties:     { // object to store preferences
                name:           { type: 'string',   minLength: 1,   maxLength: 255  },
                showCompleted:  { type: 'boolean',  default: false                  },
                showOverdue:    { type: 'boolean',  default: false                  },
                notify:         { type: 'object',   properties:     { // object to store notification preferences
                    enabled:    { type: 'boolean',  default: true                   },
                    interval:   { type: 'integer',  default: 60                     },
                    from:       { type: 'object',   properties:     { // when to start notfying_
                        hour:   { type: 'integer',  default: 8                      },
                        min:    { type: 'integer',  default: 0                      },
                        }                                                           }, 
                    to:         { type: 'object',   properties:     { // when to stop notifying
                        hour:   { type: 'integer',  default: 17                     },
                        min:    { type: 'integer',  default: 0                      },
                        }                                                           },
                    },
                },
            }
        },
        tasks:                  { type: 'array',    items:            // array of objects to store tasks
                                { type: 'object',   properties:     { // object to store task
                heading:        { type: 'string',   minLength: 1,   maxLength: 255  },
                for:            { type: 'string',   minLength: 1,   maxLength: 255  },
                description:    { type: 'string',   minLength: 1,   maxLength: 255  },
                dueDate:        { type: 'string',   minLength: 1,   maxLength: 255  },
                setDate:        { type: 'string',   minLength: 1,   maxLength: 255  },
                completed:      { type: 'boolean',  default: false                  },
            },
                required:       ['heading', 'for', 'description', 'dueDate', 'setDate', 'completed']
            }
        }
    }
}

module.exports =  { schema };



