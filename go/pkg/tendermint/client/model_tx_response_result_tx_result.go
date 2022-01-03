/*
Tendermint RPC

Tendermint supports the following RPC protocols:  * URI over HTTP * JSONRPC over HTTP * JSONRPC over websockets  ## Configuration  RPC can be configured by tuning parameters under `[rpc]` table in the `$TMHOME/config/config.toml` file or by using the `--rpc.X` command-line flags.  Default rpc listen address is `tcp://0.0.0.0:26657`. To set another address, set the `laddr` config parameter to desired value. CORS (Cross-Origin Resource Sharing) can be enabled by setting `cors_allowed_origins`, `cors_allowed_methods`, `cors_allowed_headers` config parameters.  ## Arguments  Arguments which expect strings or byte arrays may be passed as quoted strings, like `\"abc\"` or as `0x`-prefixed strings, like `0x616263`.  ## URI/HTTP  A REST like interface.      curl localhost:26657/block?height=5  ## JSONRPC/HTTP  JSONRPC requests can be POST'd to the root RPC endpoint via HTTP.      curl --header \"Content-Type: application/json\" --request POST --data '{\"method\": \"block\", \"params\": [\"5\"], \"id\": 1}' localhost:26657  ## JSONRPC/websockets  JSONRPC requests can be also made via websocket. The websocket endpoint is at `/websocket`, e.g. `localhost:26657/websocket`. Asynchronous RPC functions like event `subscribe` and `unsubscribe` are only available via websockets.  Example using https://github.com/hashrocket/ws:      ws ws://localhost:26657/websocket     > { \"jsonrpc\": \"2.0\", \"method\": \"subscribe\", \"params\": [\"tm.event='NewBlock'\"], \"id\": 1 } 

API version: Master
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package client

import (
	"encoding/json"
)

// TxResponseResultTxResult struct for TxResponseResultTxResult
type TxResponseResultTxResult struct {
	Log string `json:"log"`
	GasWanted string `json:"gas_wanted"`
	GasUsed string `json:"gas_used"`
	Tags []Event `json:"tags"`
}

// NewTxResponseResultTxResult instantiates a new TxResponseResultTxResult object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewTxResponseResultTxResult(log string, gasWanted string, gasUsed string, tags []Event) *TxResponseResultTxResult {
	this := TxResponseResultTxResult{}
	this.Log = log
	this.GasWanted = gasWanted
	this.GasUsed = gasUsed
	this.Tags = tags
	return &this
}

// NewTxResponseResultTxResultWithDefaults instantiates a new TxResponseResultTxResult object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewTxResponseResultTxResultWithDefaults() *TxResponseResultTxResult {
	this := TxResponseResultTxResult{}
	return &this
}

// GetLog returns the Log field value
func (o *TxResponseResultTxResult) GetLog() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Log
}

// GetLogOk returns a tuple with the Log field value
// and a boolean to check if the value has been set.
func (o *TxResponseResultTxResult) GetLogOk() (*string, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Log, true
}

// SetLog sets field value
func (o *TxResponseResultTxResult) SetLog(v string) {
	o.Log = v
}

// GetGasWanted returns the GasWanted field value
func (o *TxResponseResultTxResult) GetGasWanted() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.GasWanted
}

// GetGasWantedOk returns a tuple with the GasWanted field value
// and a boolean to check if the value has been set.
func (o *TxResponseResultTxResult) GetGasWantedOk() (*string, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.GasWanted, true
}

// SetGasWanted sets field value
func (o *TxResponseResultTxResult) SetGasWanted(v string) {
	o.GasWanted = v
}

// GetGasUsed returns the GasUsed field value
func (o *TxResponseResultTxResult) GetGasUsed() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.GasUsed
}

// GetGasUsedOk returns a tuple with the GasUsed field value
// and a boolean to check if the value has been set.
func (o *TxResponseResultTxResult) GetGasUsedOk() (*string, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.GasUsed, true
}

// SetGasUsed sets field value
func (o *TxResponseResultTxResult) SetGasUsed(v string) {
	o.GasUsed = v
}

// GetTags returns the Tags field value
func (o *TxResponseResultTxResult) GetTags() []Event {
	if o == nil {
		var ret []Event
		return ret
	}

	return o.Tags
}

// GetTagsOk returns a tuple with the Tags field value
// and a boolean to check if the value has been set.
func (o *TxResponseResultTxResult) GetTagsOk() (*[]Event, bool) {
	if o == nil  {
		return nil, false
	}
	return &o.Tags, true
}

// SetTags sets field value
func (o *TxResponseResultTxResult) SetTags(v []Event) {
	o.Tags = v
}

func (o TxResponseResultTxResult) MarshalJSON() ([]byte, error) {
	toSerialize := map[string]interface{}{}
	if true {
		toSerialize["log"] = o.Log
	}
	if true {
		toSerialize["gas_wanted"] = o.GasWanted
	}
	if true {
		toSerialize["gas_used"] = o.GasUsed
	}
	if true {
		toSerialize["tags"] = o.Tags
	}
	return json.Marshal(toSerialize)
}

type NullableTxResponseResultTxResult struct {
	value *TxResponseResultTxResult
	isSet bool
}

func (v NullableTxResponseResultTxResult) Get() *TxResponseResultTxResult {
	return v.value
}

func (v *NullableTxResponseResultTxResult) Set(val *TxResponseResultTxResult) {
	v.value = val
	v.isSet = true
}

func (v NullableTxResponseResultTxResult) IsSet() bool {
	return v.isSet
}

func (v *NullableTxResponseResultTxResult) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableTxResponseResultTxResult(val *TxResponseResultTxResult) *NullableTxResponseResultTxResult {
	return &NullableTxResponseResultTxResult{value: val, isSet: true}
}

func (v NullableTxResponseResultTxResult) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableTxResponseResultTxResult) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}

