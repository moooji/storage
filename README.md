# [@moooji/storage](https://github.com/moooji/storage) *2.0.9*

> Storage provider (AWS S3, Google Cloud Storage)


### src/index.js


#### create(options) 

Factory that returns a Storage instance




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| options | `object`  | Options | &nbsp; |




##### Returns


- `Storage`  



#### Storage.save(key, buffer, mimeType) 

Stores a buffer as object in Storage




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `string`  | - Key | &nbsp; |
| buffer | `Buffer`  | - Buffer | &nbsp; |
| mimeType | `string`  | - MIME type | &nbsp; |




##### Returns


- `Promise`  



#### Storage.remove(key) 

Removes one or several objects from Storage




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| key | `string` `Array.<string>`  | - Key(s) | &nbsp; |




##### Returns


- `Promise`  




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
