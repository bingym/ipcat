package ip2region

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
)

const (
	IndexBlockLength = 12
)

type Ip2Region struct {
	// db file handler
	dbFileHandler *os.File

	//header block info

	headerSip []int64
	headerPtr []int64
	headerLen int64

	// super block index info
	firstIndexPtr int64
	lastIndexPtr  int64
	totalBlocks   int64

	// for memory mode only
	// the original db binary string

	dbBinStr []byte
	dbFile   string
}

type IpInfo struct {
	Address  string `json:"address"`
	CityId   int64  `json:"-"`
	Country  string `json:"country"`
	Region   string `json:"region"`
	Province string `json:"province"`
	City     string `json:"city"`
	ISP      string `json:"isp"`
}

func (ip IpInfo) String() string {
	return fmt.Sprintf(
		"%s|%s|%s|%s|%s|%s|%s",
		ip.Address, strconv.FormatInt(ip.CityId, 10), ip.Country, ip.Region, ip.Province, ip.City, ip.ISP,
	)
}

func getIpInfo(cityId int64, line []byte) *IpInfo {
	lineSlice := strings.Split(string(line), "|")
	var ipInfo IpInfo
	length := len(lineSlice)
	ipInfo.CityId = cityId
	if length < 5 {
		for i := 0; i <= 5-length; i++ {
			lineSlice = append(lineSlice, "")
		}
	}
	ipInfo.Country = lineSlice[0]
	ipInfo.Region = lineSlice[1]
	ipInfo.Province = lineSlice[2]
	ipInfo.City = lineSlice[3]
	ipInfo.ISP = lineSlice[4]
	return &ipInfo
}

func New(path string) (*Ip2Region, error) {

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}

	return &Ip2Region{
		dbFile:        path,
		dbFileHandler: file,
	}, nil
}

func (itor *Ip2Region) Close() {
	itor.dbFileHandler.Close()
}

func (itor *Ip2Region) MemorySearch(ipStr string) (*IpInfo, error) {
	var (
		err    error
		ipInfo *IpInfo
	)
	if itor.totalBlocks == 0 {
		itor.dbBinStr, err = ioutil.ReadFile(itor.dbFile)

		if err != nil {
			return nil, err
		}

		itor.firstIndexPtr = getLong(itor.dbBinStr, 0)
		itor.lastIndexPtr = getLong(itor.dbBinStr, 4)
		itor.totalBlocks = (itor.lastIndexPtr-itor.firstIndexPtr)/IndexBlockLength + 1
	}

	ip, err := ip2long(ipStr)
	if err != nil {
		return nil, err
	}

	h := itor.totalBlocks
	var dataPtr, l int64
	for l <= h {
		m := (l + h) >> 1
		p := itor.firstIndexPtr + m*IndexBlockLength
		sip := getLong(itor.dbBinStr, p)
		if ip < sip {
			h = m - 1
		} else {
			eip := getLong(itor.dbBinStr, p+4)
			if ip > eip {
				l = m + 1
			} else {
				dataPtr = getLong(itor.dbBinStr, p+8)
				break
			}
		}
	}
	if dataPtr == 0 {
		return nil, errors.New("not found")
	}
	dataLen := (dataPtr >> 24) & 0xFF
	dataPtr = dataPtr & 0x00FFFFFF
	ipInfo = getIpInfo(getLong(itor.dbBinStr, dataPtr), itor.dbBinStr[(dataPtr)+4:dataPtr+dataLen])
	ipInfo.Address = ipStr
	return ipInfo, nil

}

func getLong(b []byte, offset int64) int64 {
	val := int64(b[offset]) |
		int64(b[offset+1])<<8 |
		int64(b[offset+2])<<16 |
		int64(b[offset+3])<<24
	return val
}

func ip2long(IpStr string) (int64, error) {
	bits := strings.Split(IpStr, ".")
	if len(bits) != 4 {
		return 0, errors.New("ip format error")
	}

	var sum int64
	for i, n := range bits {
		bit, _ := strconv.ParseInt(n, 10, 64)
		sum += bit << uint(24-8*i)
	}

	return sum, nil
}
